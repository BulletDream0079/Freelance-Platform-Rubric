const express = require("express");
const ctrl = require("../controllers/authController");
const { registerRules, loginRules } = require("../validators/authValidators");
const validate = require("../middleware/validate");
const { authRequired } = require("../middleware/auth");
const router = express.Router();

router.post("/register", registerRules, validate, ctrl.register);
router.post("/login", loginRules, validate, ctrl.login);
router.get("/me", authRequired, ctrl.me);
router.post("/logout", authRequired, ctrl.logout);

module.exports = router;
