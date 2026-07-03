const express = require("express");
const ctrl = require("../controllers/proposalController");
const { createProposalRules, statusRules } = require("../validators/proposalValidators");
const validate = require("../middleware/validate");
const { authRequired, requireRole } = require("../middleware/auth");
const router = express.Router();

router.post("/", authRequired, requireRole("freelancer"), createProposalRules, validate, ctrl.create);
router.get("/mine", authRequired, requireRole("freelancer"), ctrl.mine);
router.get("/client/me", authRequired, requireRole("client"), ctrl.forClient);
router.get("/job/:jobId", authRequired, ctrl.forJob);
router.put("/:id/status", authRequired, statusRules, validate, ctrl.setStatus);
router.delete("/:id", authRequired, ctrl.remove);

module.exports = router;
