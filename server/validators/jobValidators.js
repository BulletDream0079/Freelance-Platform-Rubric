const { body } = require("express-validator");

const CATEGORIES = [
  "Graphics & Design",
  "Programming & Tech",
  "Digital Marketing",
  "Writing & Translation",
  "Video & Animation",
  "Music & Audio",
  "Business",
  "Lifestyle",
];

exports.CATEGORIES = CATEGORIES;

exports.createJobRules = [
  body("title").trim().notEmpty().withMessage("Title is required").isLength({ max: 140 }),
  body("description").trim().notEmpty().withMessage("Description is required").isLength({ min: 20 })
    .withMessage("Description must be at least 20 characters"),
  body("category").isIn(CATEGORIES).withMessage("Invalid category"),
  body("budget").isFloat({ min: 1 }).withMessage("Budget must be a positive number"),
  body("deadline").notEmpty().withMessage("Deadline is required")
    .isISO8601().withMessage("Deadline must be a valid date"),
  body("skillsRequired").optional().isArray().withMessage("skillsRequired must be an array"),
];

exports.updateJobRules = [
  body("title").optional().trim().isLength({ min: 1, max: 140 }),
  body("description").optional().trim().isLength({ min: 20 }),
  body("category").optional().isIn(CATEGORIES),
  body("budget").optional().isFloat({ min: 1 }),
  body("deadline").optional().isISO8601(),
  body("status").optional().isIn(["open", "in-progress", "completed", "closed"]),
];
