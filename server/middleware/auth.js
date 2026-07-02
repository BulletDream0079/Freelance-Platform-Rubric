const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "freelancer-dev-secret-change-me";

function sign(user) {
  return jwt.sign(
    { id: user.id || user._id.toString(), role: user.role, email: user.email, name: user.name },
    SECRET,
    { expiresIn: "7d" }
  );
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
}

module.exports = { sign, authRequired, requireRole, SECRET };
