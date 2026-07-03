const Job = require("../models/Job");
const Proposal = require("../models/Proposal");
const SavedJob = require("../models/SavedJob");
const { asyncHandler } = require("../middleware/error");
const { logActivity } = require("../services/events");

const CLIENT_POPULATE = { path: "client", select: "-password" };

exports.list = asyncHandler(async (req, res) => {
  const { q, category, status, minBudget, maxBudget } = req.query;
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 9));

  const filter = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (minBudget || maxBudget) {
    filter.budget = {};
    if (minBudget) filter.budget.$gte = Number(minBudget);
    if (maxBudget) filter.budget.$lte = Number(maxBudget);
  }
  if (q) {
    const rx = new RegExp(q.toString().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const [total, jobs] = await Promise.all([
    Job.countDocuments(filter),
    Job.find(filter)
      .populate(CLIENT_POPULATE)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  res.json({
    jobs,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    hasMore: page * limit < total,
  });
});

// GET /api/jobs/client/me
exports.myJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ client: req.user.id }).populate(CLIENT_POPULATE).sort({ createdAt: -1 });
  res.json(jobs);
});

// GET /api/jobs/saved/me
exports.savedJobs = asyncHandler(async (req, res) => {
  const saved = await SavedJob.find({ user: req.user.id }).populate({
    path: "job",
    populate: CLIENT_POPULATE,
  });
  res.json(saved.map((s) => s.job).filter(Boolean));
});

// GET /api/jobs/:id
exports.getOne = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(CLIENT_POPULATE);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

// POST /api/jobs
exports.create = asyncHandler(async (req, res) => {
  const { title, description, category, budget, deadline, skillsRequired } = req.body;
  const job = await Job.create({
    client: req.user.id,
    title,
    description,
    category,
    budget: Number(budget),
    deadline,
    skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [],
  });
  await logActivity(req.user.id, "job.created", "Job", job._id, { title: job.title });
  const populated = await job.populate(CLIENT_POPULATE);
  res.status(201).json(populated);
});

// PUT /api/jobs/:id
exports.update = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  const isOwner = job.client.toString() === req.user.id;
  if (!isOwner && req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  const fields = ["title", "description", "category", "budget", "deadline", "status"];
  for (const f of fields) {
    if (req.body[f] !== undefined) job[f] = f === "budget" ? Number(req.body[f]) : req.body[f];
  }
  await job.save();
  await logActivity(req.user.id, "job.updated", "Job", job._id);
  const populated = await job.populate(CLIENT_POPULATE);
  res.json(populated);
});

// DELETE /api/jobs/:id
exports.remove = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  const isOwner = job.client.toString() === req.user.id;
  if (!isOwner && req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  await Proposal.deleteMany({ job: job._id });
  await SavedJob.deleteMany({ job: job._id });
  await job.deleteOne();
  await logActivity(req.user.id, "job.deleted", "Job", job._id, { title: job.title });
  res.json({ ok: true });
});

// POST /api/jobs/:id/save
exports.save = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  await SavedJob.updateOne(
    { user: req.user.id, job: job._id },
    { $setOnInsert: { user: req.user.id, job: job._id } },
    { upsert: true }
  );
  res.json({ ok: true });
});

// DELETE /api/jobs/:id/save
exports.unsave = asyncHandler(async (req, res) => {
  await SavedJob.deleteOne({ user: req.user.id, job: req.params.id });
  res.json({ ok: true });
});
