const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const User = require("../models/User");
const Payment = require("../models/Payment");
const { asyncHandler } = require("../middleware/error");
const { stripe, mode, PLATFORM_FEE_PERCENT, splitAmount } = require("../config/stripe");
const { notify, logActivity } = require("../services/events");

exports.config = (req, res) => {
  res.json({
    feePercent: PLATFORM_FEE_PERCENT,
    mode,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
  });
};

async function fundingAmountCents(job) {
  const accepted = await Proposal.findOne({ job: job._id, status: "accepted" });
  const dollars = accepted ? accepted.bid : job.budget;
  return Math.round(dollars * 100);
}

exports.fund = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.client.toString() !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  if (!job.hiredFreelancer) return res.status(400).json({ error: "Accept a proposal before funding the job" });
  if (["funded", "released"].includes(job.paymentStatus)) {
    return res.status(400).json({ error: "Job is already funded" });
  }

  const amountCents = await fundingAmountCents(job);
  const { platformFeeCents, freelancerPayoutCents, feePercent } = splitAmount(amountCents);

  let paymentIntentId = null;
  let clientSecret = null;

  if (mode === "live" && stripe) {
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      capture_method: "automatic",
      metadata: { jobId: job.id, clientId: req.user.id, platformFeeCents: String(platformFeeCents) },
    });
    paymentIntentId = intent.id;
    clientSecret = intent.client_secret;
  } else {
    paymentIntentId = "pi_mock_" + Math.random().toString(36).slice(2, 12);
  }

  job.paymentStatus = "funded";
  job.escrowAmountCents = amountCents;
  job.platformFeeCents = platformFeeCents;
  job.freelancerPayoutCents = freelancerPayoutCents;
  job.stripePaymentIntentId = paymentIntentId;
  await job.save();

  await Payment.create({
    job: job._id, client: job.client, freelancer: job.hiredFreelancer,
    amountCents, platformFeeCents, freelancerPayoutCents, feePercent,
    type: "escrow_funded", stripePaymentIntentId: paymentIntentId,
  });
  await notify(job.hiredFreelancer, "job_funded", `Escrow funded for "${job.title}". You can start work.`, `/freelancer`);
  await logActivity(req.user.id, "payment.funded", "Job", job._id, { amountCents });

  res.json({
    ok: true, mode, clientSecret,
    job: await job.populate({ path: "client", select: "-password" }),
    breakdown: { amountCents, platformFeeCents, freelancerPayoutCents, feePercent },
  });
});

exports.release = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.client.toString() !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  if (job.paymentStatus !== "funded") return res.status(400).json({ error: "Job must be funded before release" });

  if (mode === "live" && stripe && job.hiredFreelancer) {
    const freelancer = await User.findById(job.hiredFreelancer);
    if (freelancer?.stripeAccountId) {
      await stripe.transfers.create({
        amount: job.freelancerPayoutCents, currency: "usd",
        destination: freelancer.stripeAccountId, metadata: { jobId: job.id },
      });
    }
  }

  job.paymentStatus = "released";
  job.status = "completed";
  await job.save();

  if (job.hiredFreelancer) {
    await User.updateOne({ _id: job.hiredFreelancer }, { $inc: { earningsCents: job.freelancerPayoutCents } });
  }

  await Payment.create({
    job: job._id, client: job.client, freelancer: job.hiredFreelancer,
    amountCents: job.escrowAmountCents, platformFeeCents: job.platformFeeCents,
    freelancerPayoutCents: job.freelancerPayoutCents, feePercent: PLATFORM_FEE_PERCENT,
    type: "released", stripePaymentIntentId: job.stripePaymentIntentId,
  });
  await notify(job.hiredFreelancer, "payment_released", `Payment released for "${job.title}"!`, `/freelancer`);
  await logActivity(req.user.id, "payment.released", "Job", job._id, { payoutCents: job.freelancerPayoutCents });

  res.json({ ok: true, job });
});

exports.refund = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  const isOwner = job.client.toString() === req.user.id;
  if (!isOwner && req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  if (job.paymentStatus !== "funded") return res.status(400).json({ error: "Only funded jobs can be refunded" });

  if (mode === "live" && stripe && job.stripePaymentIntentId) {
    try {
      await stripe.refunds.create({ payment_intent: job.stripePaymentIntentId });
    } catch (e) {
      console.warn("Stripe refund note:", e.message);
    }
  }

  job.paymentStatus = "refunded";
  job.status = "open";
  job.hiredFreelancer = null;
  await job.save();

  await Payment.create({
    job: job._id, client: job.client, freelancer: null,
    amountCents: job.escrowAmountCents, platformFeeCents: 0, freelancerPayoutCents: 0,
    feePercent: PLATFORM_FEE_PERCENT, type: "refunded", stripePaymentIntentId: job.stripePaymentIntentId,
  });
  await logActivity(req.user.id, "payment.refunded", "Job", job._id);

  res.json({ ok: true, job });
});

exports.mine = asyncHandler(async (req, res) => {
  const filter = req.user.role === "freelancer" ? { freelancer: req.user.id } : { client: req.user.id };
  const payments = await Payment.find(filter).populate({ path: "job", select: "title" }).sort({ createdAt: -1 });
  res.json(payments);
});
