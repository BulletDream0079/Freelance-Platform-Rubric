const express = require("express");
const { store } = require("../data/store");
const { authRequired, requireRole } = require("../middleware/auth");
const router = express.Router();
const safeUser = (u) => {
  const { password, ...rest } = u;
  return rest;
};

router.use(authRequired, requireRole("admin"));

router.get("/stats", (req, res) => {
  const usersByRole = store.users.reduce(
    (acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    },
    { client: 0, freelancer: 0, admin: 0 }
  );
  const jobsByStatus = store.jobs.reduce(
    (acc, j) => {
      acc[j.status] = (acc[j.status] || 0) + 1;
      return acc;
    },
    { open: 0, "in-progress": 0, completed: 0 }
  );
  const proposalsByStatus = store.proposals.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    { pending: 0, accepted: 0, rejected: 0 }
  );
  res.json({
    totalUsers: store.users.length,
    totalJobs: store.jobs.length,
    totalProposals: store.proposals.length,
    bannedUsers: store.users.filter((u) => u.banned).length,
    usersByRole,
    jobsByStatus,
    proposalsByStatus,
  });
});

router.get("/users", (req, res) => {
  res.json(store.users.map(safeUser));
});

router.put("/users/:id/ban", (req, res) => {
  const user = store.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.role === "admin") return res.status(400).json({ error: "Cannot ban an admin" });
  user.banned = !!req.body.banned;
  res.json(safeUser(user));
});

router.delete("/users/:id", (req, res) => {
  const idx = store.users.findIndex((u) => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "User not found" });
  if (store.users[idx].role === "admin")
    return res.status(400).json({ error: "Cannot delete admin" });
  store.users.splice(idx, 1);
  res.json({ ok: true });
});

router.get("/jobs", (req, res) => {
  const jobs = store.jobs.map((j) => ({
    ...j,
    client: safeUser(store.users.find((u) => u.id === j.clientId) || {}),
  }));
  res.json(jobs);
});

router.get("/proposals", (req, res) => {
  const list = store.proposals.map((p) => ({
    ...p,
    job: store.jobs.find((j) => j.id === p.jobId) || null,
    freelancer: safeUser(store.users.find((u) => u.id === p.freelancerId) || {}),
  }));
  res.json(list);
});

module.exports = router;