const Job = require("../models/Job");
const Message = require("../models/Message");
const { asyncHandler } = require("../middleware/error");
const { notify, logActivity } = require("../services/events");

async function loadThreadParticipant(req, res) {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return null;
  }
  if (!job.hiredFreelancer) {
    res.status(400).json({ error: "Messaging opens after a proposal is accepted" });
    return null;
  }
  const uid = req.user.id;
  const isClient = job.client.toString() === uid;
  const isFreelancer = job.hiredFreelancer.toString() === uid;
  if (!isClient && !isFreelancer && req.user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return null;
  }
  return { job, isClient, isFreelancer };
}

exports.list = asyncHandler(async (req, res) => {
  const ctx = await loadThreadParticipant(req, res);
  if (!ctx) return;

  const messages = await Message.find({ job: ctx.job._id })
    .populate({ path: "sender", select: "name avatar role" })
    .sort({ createdAt: 1 });

  await Message.updateMany(
    { job: ctx.job._id, sender: { $ne: req.user.id }, readBy: { $ne: req.user.id } },
    { $addToSet: { readBy: req.user.id } }
  );

  res.json(messages);
});

exports.send = asyncHandler(async (req, res) => {
  const ctx = await loadThreadParticipant(req, res);
  if (!ctx) return;

  const message = await Message.create({
    job: ctx.job._id,
    sender: req.user.id,
    body: req.body.body,
    readBy: [req.user.id],
  });

  const recipient = ctx.isClient ? ctx.job.hiredFreelancer : ctx.job.client;
  const link = ctx.isClient ? `/freelancer` : `/client/manage`;
  await notify(recipient, "message_received", `New message about "${ctx.job.title}"`, link);
  await logActivity(req.user.id, "message.sent", "Job", ctx.job._id);

  const populated = await message.populate({ path: "sender", select: "name avatar role" });
  res.status(201).json(populated);
});
