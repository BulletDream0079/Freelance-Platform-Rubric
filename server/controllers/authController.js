const User = require("../models/User");
const { sign } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/error");
const { logActivity } = require("../services/events");

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!["client", "freelancer"].includes(role)) {
    return res.status(400).json({ error: "role must be client or freelancer" });
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const user = await User.create({
    name,
    email,
    password,
    role,
    level: role === "freelancer" ? "New Seller" : null,
  });

  await logActivity(user.id, "user.registered", "User", user._id, { role });
  const token = sign(user);
  res.status(201).json({ user: user.toSafeJSON(), token });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  if (user.banned) return res.status(403).json({ error: "Account is banned" });

  const ok = await user.comparePassword(password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = sign(user);
  res.json({ user: user.toSafeJSON(), token });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user.toSafeJSON());
});

exports.logout = asyncHandler(async (req, res) => {
  await logActivity(req.user.id, "user.logout", "User", req.user.id);
  res.json({ ok: true });
});
