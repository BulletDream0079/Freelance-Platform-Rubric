const { body } = require("express-validator");

exports.registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 80 }),
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").isIn(["client", "freelancer"]).withMessage("Role must be client or freelancer"),
];

exports.loginRules = [
  body("email").trim().isEmail().withMessage("A valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
