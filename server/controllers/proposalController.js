const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const { asyncHandler } = require("../middleware/error");
const { notify, logActivity } = require("../services/events");

const POPULATE = [
  { path: "job" },
  { path: "freelancer", select: "-password" },
];

exports.create = asyncHandler(async (req, res) => {
  const { jobId, coverLetter, bid, deliveryDays } = req.body;
  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.status !== "open") return res.status(400).json({ error: "Job is not accepting proposals" });

  const dup = await Proposal.findOne({ job: jobId, freelancer: req.user.id });
  if (dup) return res.status(409).json({ error: "You already applied to this job" });

  const proposal = await Proposal.create({
    job: jobId,
    freelancer: req.user.id,
    coverLetter,
    bid: Number(bid),
    deliveryDays: Number(deliveryDays),
  });

  await notify(
    job.client,
    "proposal_received",
    `${req.user.name} applied to "${job.title}"`,
    `/client/jobs/${job.id}/proposals`
  );
  await logActivity(req.user.id, "proposal.created", "Proposal", proposal._id, { jobId: job.id });

  const populated = await proposal.populate(POPULATE);
  res.status(201).json(populated);
});

exports.mine = asyncHandler(async (req, res) => {
  const list = await Proposal.find({ freelancer: req.user.id }).populate(POPULATE).sort({ createdAt: -1 });
  res.json(list);
});

exports.forClient = asyncHandler(async (req, res) => {
  const myJobs = await Job.find({ client: req.user.id }).select("_id");
  const ids = myJobs.map((j) => j._id);
  const list = await Proposal.find({ job: { $in: ids } }).populate(POPULATE).sort({ createdAt: -1 });
  res.json(list);
});

exports.forJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.client.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const list = await Proposal.find({ job: req.params.jobId }).populate(POPULATE).sort({ createdAt: -1 });
  res.json(list);
});

exports.setStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) return res.status(404).json({ error: "Proposal not found" });

  const job = await Job.findById(proposal.job);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.client.toString() !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (proposal.status !== "pending") {
    return res.status(409).json({ error: `Proposal already ${proposal.status}` });
  }
  if (status === "accepted") {
    const alreadyAccepted = await Proposal.findOne({ job: job._id, status: "accepted" });
    if (alreadyAccepted) {
      return res.status(409).json({ error: "This job already has an accepted proposal" });
    }
  }

  proposal.status = status;
  await proposal.save();

  if (status === "accepted") {
    job.status = "in-progress";
    job.hiredFreelancer = proposal.freelancer;
    await job.save();
    const others = await Proposal.find({ job: job._id, _id: { $ne: proposal._id }, status: "pending" });
    await Proposal.updateMany(
      { job: job._id, _id: { $ne: proposal._id }, status: "pending" },
      { $set: { status: "rejected" } }
    );
    await notify(proposal.freelancer, "proposal_accepted", `Your proposal for "${job.title}" was accepted!`, `/freelancer`);
    for (const o of others) {
      await notify(o.freelancer, "proposal_rejected", `Your proposal for "${job.title}" was not selected.`, `/freelancer`);
    }
    await logActivity(req.user.id, "proposal.accepted", "Proposal", proposal._id, { jobId: job.id });
  } else {
    await notify(proposal.freelancer, "proposal_rejected", `Your proposal for "${job.title}" was rejected.`, `/freelancer`);
    await logActivity(req.user.id, "proposal.rejected", "Proposal", proposal._id, { jobId: job.id });
  }

  const populated = await proposal.populate(POPULATE);
  res.json(populated);
});

exports.remove = asyncHandler(async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) return res.status(404).json({ error: "Proposal not found" });
  const isOwner = proposal.freelancer.toString() === req.user.id;
  if (!isOwner && req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  await proposal.deleteOne();
  res.json({ ok: true });
});
