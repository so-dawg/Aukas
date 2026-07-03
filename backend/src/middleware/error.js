const ApiError = require("../utils/ApiError.js");

// Global Express error handler — catches ApiError (thrown by controllers/middleware)
// and unexpected errors. Must be the last middleware in the chain.
function errorHandler(err, _req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json(err.toResponse());
  }
  // PostgreSQL unique violation (e.g. duplicate email/slug)
  if (err && err.code === "23505") {
    return res.status(409).json({
      error: { code: "CONFLICT", message: "Resource already exists." },
    });
  }
  console.error(err);
  return res
    .status(500)
    .json({ error: { code: "INTERNAL", message: "Internal server error." } });
}

module.exports = errorHandler;
