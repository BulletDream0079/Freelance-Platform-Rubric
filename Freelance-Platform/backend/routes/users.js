const express = require("express");
const { store } = require("../data/store");
const { authRequired } = require("../middleware/auth");
const router = express.Router();

function safe(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

router.get("/:id", (req, res) => {
  const user = store.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(safe(user));
});

router.put("/me/update", authRequired, (req, res) => {
  const user = store.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  const editable = ["name", "title", "bio", "skills", "portfolio", "experience", "avatar"];
  for (const key of editable) {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  }
  res.json(safe(user));
});

module.exports = router;