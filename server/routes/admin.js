const express = require("express");
const { body } = require("express-validator");
const ctrl = require("../controllers/adminController");
const validate = require("../middleware/validate");
const { authRequired, requireRole } = require("../middleware/auth");
const router = express.Router();

router.use(authRequired, requireRole("admin"));

router.get("/stats", ctrl.stats);
router.get("/users", ctrl.users);
router.put("/users/:id/ban", ctrl.banUser);
router.put("/users/:id/role", [body("role").isIn(["client", "freelancer", "admin"])], validate, ctrl.setRole);
router.delete("/users/:id", ctrl.deleteUser);
router.get("/jobs", ctrl.jobs);
router.get("/proposals", ctrl.proposals);
router.get("/payments", ctrl.payments);
router.get("/activity", ctrl.activity);
router.get("/settings", ctrl.getSettings);
router.put("/settings", ctrl.updateSettings);

module.exports = router;
