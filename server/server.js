require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error");
const app = express();

app.use(helmet());

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "6mb" }));
app.use(mongoSanitize());
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });
app.use("/api/auth", authLimiter);

app.get("/api/health", (req, res) =>
  res.json({ ok: true, service: "freelance-platform", time: new Date().toISOString() })
);
app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  });
}

module.exports = app;
