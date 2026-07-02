const { validationResult } = require("express-validator");

// protected call of code 400 with list of errors instead of continuing to handlers
function validate(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: result.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validate;
