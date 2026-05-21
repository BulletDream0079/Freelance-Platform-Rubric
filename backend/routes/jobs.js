const express = require("express");
const { store, nextJobId } = require("../data/store");
const { authRequired, requireRole } = require("../middleware/auth");
const router = express.Router();

function withClient(){};

router.get("/", (req, res) => {});

router.get("/:id", (req, res) => {});

router.post("/", authRequired, requireRole("client"), (req, res) => {});

router.put("/:id", authRequired, (req, res) => {});

router.delete("/:id", authRequired, (req, res) => {});

router.get("/client/me", authRequired, requireRole("client"), (req, res) => {});

router.get("/saved/me", authRequired, requireRole("freelancer"), (req, res) => {});

router.post("/:id/save", authRequired, requireRole("freelancer"), (req, res) => {});

router.delete("/:id/save", authRequired, requireRole("freelancer"), (req, res) => {});

module.exports = router;