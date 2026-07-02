// async the route handlers
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function notFound(req, res, next) {
  res.status(404).json({ error: "Not found" });
}

// centralized error handling
function errorHandler(err, req, res, next) {
  if (err.name === "CastError") {
    return res.status(404).json({ error: "Resource not found" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(err.errors).map((e) => ({ field: e.path, message: e.message })),
    });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || { field: "value" })[0];
    return res.status(409).json({ error: `${field} already in use` });
  }

  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status >= 500 ? "Server error" : err.message || "Error" });
}

module.exports = { asyncHandler, notFound, errorHandler };
