const express = require("express");
const { store } = require("../data/store");
const { authRequired } = require("../middleware/auth");
const router = express.Router();

function safe(){};

router.get("/:id", (req, res) => {});

router.put("/me/update", authRequired, (req, res) => {});

module.exports = router;