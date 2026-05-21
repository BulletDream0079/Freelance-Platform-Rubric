const express = require("express");
const { store } = require("../data/store");
const { authRequired, requireRole } = require("../middleware/auth");
const router = express.Router();

router.use(authRequired, requireRole("admin"));

router.get("/stats", (req, res) => {});

router.get("/users", (req, res) => {});

router.put("/users/:id/ban", (req, res) => {});

router.delete("/users/:id", (req, res) => {});

router.get("/jobs", (req, res) => {});

router.get("/proposals", (req, res) => {});

module.exports = router;