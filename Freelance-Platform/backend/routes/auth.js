const express = require("express");
const bcrypt = require("bcryptjs");
const { store, nextUserId } = require("../data/store");
const { sign, authRequired } = require("../middleware/auth");
const router = express.Router();

router.post("/register", (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "name, email, password, role are required" });
  }
  if (!["client", "freelancer"].includes(role)) {
    return res.status(400).json({ error: "role must be client or freelancer" });
  }
  if (store.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "Email already in use" });
  }
  const newUser = {
    id: nextUserId(),
    name,
    email,
    password: bcrypt.hashSync(password, 8),
    role,
    avatar: `https://i.pravatar.cc/120?u=${encodeURIComponent(email)}`,
    bio: "",
    skills: [],
    portfolio: [],
    experience: "",
    rating: 0,
    reviewCount: 0,
    level: role === "freelancer" ? "New Seller" : undefined,
    createdAt: new Date().toISOString(),
    banned: false,
  };
  store.users.push(newUser);
  const token = sign(newUser);
  const { password: _pw, ...safe } = newUser;
  res.status(201).json({ user: safe, token });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  if (user.banned) return res.status(403).json({ error: "Account is banned" });
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = sign(user);
  const { password: _pw, ...safe } = user;
  res.json({ user: safe, token });
});

router.get("/me", authRequired, (req, res) => {
  const user = store.users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  const { password, ...safe } = user;
  res.json(safe);
});

module.exports = router;