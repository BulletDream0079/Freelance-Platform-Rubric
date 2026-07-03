const express = require("express");
const { body } = require("express-validator");
const ctrl = require("../controllers/messageController");
const validate = require("../middleware/validate");
const { authRequired } = require("../middleware/auth");
const router = express.Router();
const sendRules = [
  body("body").trim().notEmpty().withMessage("Message cannot be empty").isLength({ max: 2000 }),
];

router.get("/job/:jobId", authRequired, ctrl.list);
router.post("/job/:jobId", authRequired, sendRules, validate, ctrl.send);

module.exports = router;
