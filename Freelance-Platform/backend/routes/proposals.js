const express = require("express");
const { store, nextProposalId } = require("../data/store");
const { authRequired, requireRole } = require("../middleware/auth");
const router = express.Router();

function enrich(p) {
  const job = store.jobs.find((j) => j.id === p.jobId) || null;
  const freelancer = store.users.find((u) => u.id === p.freelancerId);
  let freelancerSafe = null;
  if (freelancer) {
    const { password, ...safe } = freelancer;
    freelancerSafe = safe;
  }
  return { ...p, job, freelancer: freelancerSafe };
}

router.post("/", authRequired, requireRole("freelancer"), (req, res) => {
  const { jobId, coverLetter, bid, deliveryDays } = req.body || {};
  if (!jobId || !coverLetter || !bid || !deliveryDays) {
    return res
      .status(400)
      .json({ error: "jobId, coverLetter, bid, deliveryDays are required" });
  }
  const job = store.jobs.find((j) => j.id === jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.status !== "open") {
    return res.status(400).json({ error: "Job is not accepting proposals" });
  }
  const dup = store.proposals.find(
    (p) => p.jobId === jobId && p.freelancerId === req.user.id
  );
  if (dup) return res.status(409).json({ error: "You already applied to this job" });
  const proposal = {
    id: nextProposalId(),
    jobId,
    freelancerId: req.user.id,
    coverLetter,
    bid: Number(bid),
    deliveryDays: Number(deliveryDays),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  store.proposals.push(proposal);
  res.status(201).json(enrich(proposal));
});

router.get("/mine", authRequired, requireRole("freelancer"), (req, res) => {
  const list = store.proposals
    .filter((p) => p.freelancerId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(enrich);
  res.json(list);
});

router.get("/job/:jobId", authRequired, (req, res) => {
  const job = store.jobs.find((j) => j.id === req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.clientId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const list = store.proposals
    .filter((p) => p.jobId === req.params.jobId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(enrich);
  res.json(list);
});

router.get("/client/me", authRequired, requireRole("client"), (req, res) => {
  const myJobIds = new Set(
    store.jobs.filter((j) => j.clientId === req.user.id).map((j) => j.id)
  );
  const list = store.proposals
    .filter((p) => myJobIds.has(p.jobId))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(enrich);
  res.json(list);
});

router.put("/:id/status", authRequired, (req, res) => {
  const proposal = store.proposals.find((p) => p.id === req.params.id);
  if (!proposal) return res.status(404).json({ error: "Proposal not found" });
  const job = store.jobs.find((j) => j.id === proposal.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  if (job.clientId !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { status } = req.body || {};
  if (!["pending", "accepted", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  proposal.status = status;
  if (status === "accepted") {
    job.status = "in-progress";
    store.proposals.forEach((other) => {
      if (other.jobId === job.id && other.id !== proposal.id && other.status === "pending") {
        other.status = "rejected";
      }
    });
  }
  res.json(enrich(proposal));
});

router.delete("/:id", authRequired, (req, res) => {
  const idx = store.proposals.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Proposal not found" });
  const proposal = store.proposals[idx];
  const isOwner = proposal.freelancerId === req.user.id;
  const isAdmin = req.user.role === "admin";
  if (!isOwner && !isAdmin) return res.status(403).json({ error: "Forbidden" });
  store.proposals.splice(idx, 1);
  res.json({ ok: true });
});

module.exports = router;