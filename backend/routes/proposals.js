const express = require("express");
const { store, nextProposalId } = require("../data/store");
const { authRequired, requireRole } = require("../middleware/auth");
const router = express.Router();

function enrich(){};

router.post("/", authRequired, requireRole("freelancer"), (req, res) => {});

router.get("/mine", authRequired, requireRole("freelancer"), (req, res) => {});

router.get("/job/:jobId", authRequired, (req, res) => {});

router.get("/client/me", authRequired, requireRole("client"), (req, res) => {});

router.put("/:id/status", authRequired, (req, res) => {});

router.delete("/:id", authRequired, (req, res) => {});

module.exports = router;