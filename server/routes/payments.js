const express = require("express");
const ctrl = require("../controllers/paymentController");
const { authRequired, requireRole } = require("../middleware/auth");
const router = express.Router();

router.get("/config", ctrl.config);
router.get("/mine", authRequired, ctrl.mine);
router.post("/jobs/:id/fund", authRequired, requireRole("client"), ctrl.fund);
router.post("/jobs/:id/release", authRequired, requireRole("client"), ctrl.release);
router.post("/jobs/:id/refund", authRequired, ctrl.refund);

module.exports = router;
