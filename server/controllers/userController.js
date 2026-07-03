const User = require("../models/User");
const { asyncHandler } = require("../middleware/error");
const { logActivity } = require("../services/events");

const MAX_AVATAR_CHARS = 3_500_000;

exports.getOne = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user.toSafeJSON());
});

exports.updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });

  const editable = ["name", "title", "bio", "skills", "portfolio", "experience"];
  for (const key of editable) {
    if (req.body[key] !== undefined) user[key] = req.body[key];
  }
  await user.save();
  await logActivity(req.user.id, "user.updated_profile", "User", user._id);
  res.json(user.toSafeJSON());
});

exports.updateAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.body;
  if (avatar !== null && typeof avatar !== "string") {
    return res.status(400).json({ error: "avatar must be a base64 data URL or null" });
  }
  if (typeof avatar === "string") {
    if (!/^data:image\/(png|jpe?g|gif|webp);base64,/.test(avatar)) {
      return res.status(400).json({ error: "avatar must be a valid image data URL" });
    }
    if (avatar.length > MAX_AVATAR_CHARS) {
      return res.status(413).json({ error: "Image too large. Please use one under ~2MB." });
    }
  }
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.avatar = avatar;
  await user.save();
  res.json(user.toSafeJSON());
});
