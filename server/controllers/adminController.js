const User = require("../models/User");
const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const Payment = require("../models/Payment");
const ActivityLog = require("../models/ActivityLog");
const Setting = require("../models/Setting");
const { asyncHandler } = require("../middleware/error");
const { logActivity } = require("../services/events");

function countBy(docs, key, seed) {
  return docs.reduce((acc, d) => {
    acc[d[key]] = (acc[d[key]] || 0) + 1;
    return acc;
  }, { ...seed });
}

exports.stats = asyncHandler(async (req, res) => {
  const [users, jobs, proposals, released] = await Promise.all([
    User.find().select("role banned"),
    Job.find().select("status"),
    Proposal.find().select("status"),
    Payment.find({ type: "released" }).select("platformFeeCents amountCents freelancerPayoutCents"),
  ]);

  res.json({
    totalUsers: users.length,
    totalJobs: jobs.length,
    totalProposals: proposals.length,
    bannedUsers: users.filter((u) => u.banned).length,
    usersByRole: countBy(users, "role", { client: 0, freelancer: 0, admin: 0 }),
    jobsByStatus: countBy(jobs, "status", { open: 0, "in-progress": 0, completed: 0, closed: 0 }),
    proposalsByStatus: countBy(proposals, "status", { pending: 0, accepted: 0, rejected: 0 }),
    platformRevenueCents: released.reduce((s, p) => s + p.platformFeeCents, 0),
    grossVolumeCents: released.reduce((s, p) => s + p.amountCents, 0),
    paidOutCents: released.reduce((s, p) => s + p.freelancerPayoutCents, 0),
    completedTransactions: released.length,
  });
});

exports.users = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users.map((u) => u.toSafeJSON()));
});

exports.banUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.role === "admin") return res.status(400).json({ error: "Cannot ban an admin" });
  user.banned = !!req.body.banned;
  await user.save();
  await logActivity(req.user.id, user.banned ? "admin.banned_user" : "admin.unbanned_user", "User", user._id);
  res.json(user.toSafeJSON());
});

exports.setRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["client", "freelancer", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.role = role;
  await user.save();
  await logActivity(req.user.id, "admin.changed_role", "User", user._id, { role });
  res.json(user.toSafeJSON());
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.role === "admin") return res.status(400).json({ error: "Cannot delete admin" });
  await user.deleteOne();
  await logActivity(req.user.id, "admin.deleted_user", "User", user._id);
  res.json({ ok: true });
});

exports.jobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate({ path: "client", select: "-password" }).sort({ createdAt: -1 });
  res.json(jobs);
});

exports.proposals = asyncHandler(async (req, res) => {
  const proposals = await Proposal.find()
    .populate({ path: "job" })
    .populate({ path: "freelancer", select: "-password" })
    .sort({ createdAt: -1 });
  res.json(proposals);
});

exports.payments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate({ path: "job", select: "title" })
    .populate({ path: "client", select: "name email" })
    .populate({ path: "freelancer", select: "name email" })
    .sort({ createdAt: -1 });
  res.json(payments);
});

exports.activity = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 30);
  const [total, logs] = await Promise.all([
    ActivityLog.countDocuments(),
    ActivityLog.find()
      .populate({ path: "actor", select: "name role" })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);
  res.json({ logs, total, page, totalPages: Math.ceil(total / limit) || 1 });
});

exports.getSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.getSingleton();
  res.json(settings);
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.getSingleton();
  const editable = ["platformName", "allowRegistrations", "maintenanceMode"];
  for (const key of editable) {
    if (req.body[key] !== undefined) settings[key] = req.body[key];
  }
  await settings.save();
  await logActivity(req.user.id, "admin.updated_settings", "Setting", settings._id);
  res.json(settings);
});
