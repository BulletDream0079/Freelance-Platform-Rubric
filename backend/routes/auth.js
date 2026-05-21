const express = require("express");
const bcrypt = require("bcryptjs");
const { store, nextUserId } = require("../data/store");
const { sign, authRequired } = require("../middleware/auth");
const router = express.Router();

router.post("/register", (req, res) => {});

router.post("/login", (req, res) => {});

router.get("/me", authRequired, (req, res) => {});

module.exports = router;