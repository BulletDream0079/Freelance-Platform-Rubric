const express = require("express");
const { body } = require("express-validator");
const ctrl = require("../controllers/userController");
const validate = require("../middleware/validate");
const { authRequired } = require("../middleware/auth");
const router = express.Router();
const updateRules = [
  body("name").optional().trim().isLength({ min: 1, max: 80 }),
  body("bio").optional().isLength({ max: 2000 }),
  body("skills").optional().isArray(),
  body("portfolio").optional().isArray(),
];

router.get("/:id", ctrl.getOne);
router.put("/me/update", authRequired, updateRules, validate, ctrl.updateMe);
router.put("/me/avatar", authRequired, ctrl.updateAvatar);

module.exports = router;
