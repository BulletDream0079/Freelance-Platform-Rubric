const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const proposalRoutes = require("./routes/proposals");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "freelance-platform", time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`Demo accounts:`);
  console.log(`  admin@demo.com / admin123`);
  console.log(`  client@demo.com / client123  (client)`);
  console.log(`  free@demo.com  / free123    (freelancer)`);
});