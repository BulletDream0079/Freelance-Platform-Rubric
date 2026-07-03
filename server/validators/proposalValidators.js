const { body } = require("express-validator");

exports.createProposalRules = [
  body("jobId").notEmpty().withMessage("jobId is required").isMongoId().withMessage("Invalid jobId"),
  body("coverLetter").trim().notEmpty().withMessage("Cover letter is required")
    .isLength({ min: 10, max: 3000 }).withMessage("Cover letter must be 10–3000 characters"),
  body("bid").isFloat({ min: 1 }).withMessage("Bid must be a positive number"),
  body("deliveryDays").isInt({ min: 1, max: 365 }).withMessage("Delivery days must be 1–365"),
];

exports.statusRules = [
  body("status").isIn(["accepted", "rejected"]).withMessage("Status must be accepted or rejected"),
];
