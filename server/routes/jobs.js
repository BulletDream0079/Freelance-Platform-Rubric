const express = require("express");
const ctrl = require("../controllers/jobController");
const { createJobRules, updateJobRules } = require("../validators/jobValidators");
const validate = require("../middleware/validate");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", ctrl.list);

router.get("/client/me", authRequired, requireRole("client"), ctrl.myJobs);
router.get("/saved/me", authRequired, requireRole("freelancer"), ctrl.savedJobs);
router.get("/:id", ctrl.getOne);
router.post("/", authRequired, requireRole("client"), createJobRules, validate, ctrl.create);
router.put("/:id", authRequired, updateJobRules, validate, ctrl.update);
router.delete("/:id", authRequired, ctrl.remove);
router.post("/:id/save", authRequired, requireRole("freelancer"), ctrl.save);
router.delete("/:id/save", authRequired, requireRole("freelancer"), ctrl.unsave);

module.exports = router;
