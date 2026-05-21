const express = require("express");
const { store, nextJobId } = require("../data/store");
const { authRequired, requireRole } = require("../middleware/auth");
const router = express.Router();

function withClient(job) {
  const client = store.users.find((u) => u.id === job.clientId);
  if (!client) return { ...job, client: null };
  const { password, ...safe } = client;
  return { ...job, client: safe };
}

router.get("/", (req, res) => {
  const { q, category, status, minBudget, maxBudget } = req.query;
  let results = [...store.jobs];

  if (q) {
    const term = q.toString().toLowerCase();
    results = results.filter(
      (j) =>
        j.title.toLowerCase().includes(term) ||
        j.description.toLowerCase().includes(term)
    );
  }
  if (category) results = results.filter((j) => j.category === category);
  if (status) results = results.filter((j) => j.status === status);
  if (minBudget) results = results.filter((j) => j.budget >= Number(minBudget));
  if (maxBudget) results = results.filter((j) => j.budget <= Number(maxBudget));

  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(results.map(withClient));
});

router.get("/:id", (req, res) => {
  const job = store.jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(withClient(job));
});

router.post("/", authRequired, requireRole("client"), (req, res) => {
  const { title, description, category, budget, deadline } = req.body || {};
  if (!title || !description || !category || !budget || !deadline) {
    return res
      .status(400)
      .json({ error: "title, description, category, budget, deadline are required" });
  }
  const job = {
    id: nextJobId(),
    clientId: req.user.id,
    title,
    description,
    category,
    budget: Number(budget),
    deadline,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  store.jobs.push(job);
  res.status(201).json(withClient(job));
});

router.put("/:id", authRequired, (req, res) => {
  const job = store.jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  const isOwner = job.clientId === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });

  const { title, description, category, budget, deadline, status } = req.body || {};
  if (title !== undefined) job.title = title;
  if (description !== undefined) job.description = description;
  if (category !== undefined) job.category = category;
  if (budget !== undefined) job.budget = Number(budget);
  if (deadline !== undefined) job.deadline = deadline;
  if (status !== undefined) job.status = status;
  res.json(withClient(job));
});

router.delete("/:id", authRequired, (req, res) => {
  const idx = store.jobs.findIndex((j) => j.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Job not found" });
  const job = store.jobs[idx];
  const isOwner = job.clientId === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });
  store.jobs.splice(idx, 1);
  // Cascade delete proposals for this job
  for (let i = store.proposals.length - 1; i >= 0; i--) {
    if (store.proposals[i].jobId === req.params.id) store.proposals.splice(i, 1);
  }
  res.json({ ok: true });
});

router.get("/client/me", authRequired, requireRole("client"), (req, res) => {
  const jobs = store.jobs
    .filter((j) => j.clientId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(withClient);
  res.json(jobs);
});

router.get("/saved/me", authRequired, requireRole("freelancer"), (req, res) => {
  const ids = store.savedJobs
    .filter((s) => s.userId === req.user.id)
    .map((s) => s.jobId);
  const jobs = store.jobs.filter((j) => ids.includes(j.id)).map(withClient);
  res.json(jobs);
});

router.post("/:id/save", authRequired, requireRole("freelancer"), (req, res) => {
  const job = store.jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  const exists = store.savedJobs.find(
    (s) => s.userId === req.user.id && s.jobId === req.params.id
  );
  if (!exists) store.savedJobs.push({ userId: req.user.id, jobId: req.params.id });
  res.json({ ok: true });
});

router.delete("/:id/save", authRequired, requireRole("freelancer"), (req, res) => {
  const idx = store.savedJobs.findIndex(
    (s) => s.userId === req.user.id && s.jobId === req.params.id
  );
  if (idx !== -1) store.savedJobs.splice(idx, 1);
  res.json({ ok: true });
});

module.exports = router;