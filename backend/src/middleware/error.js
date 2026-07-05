const ApiError = require("../utils/ApiError");

// Maps PostgreSQL error codes to HTTP responses
const PG_ERRORS = {
  "22P02": {
    code: "BAD_REQUEST",
    status: 400,
    message: "Invalid input syntax.",
  },
  23503: {
    code: "CONFLICT",
    status: 409,
    message: "Referenced resource does not exist.",
  },
  23505: { code: "CONFLICT", status: 409, message: "Resource already exists." },
  23514: {
    code: "BAD_REQUEST",
    status: 400,
    message: "Check constraint violation.",
  },
};

function errorHandler(err, req, res, _next) {
  const requestId = req.requestId || null;

  // Known application errors
  if (err instanceof ApiError) {
    return res.status(err.status).json(err.toResponse(requestId));
  }

  // PostgreSQL driver errors
  if (err && err.code && PG_ERRORS[err.code]) {
    const pg = PG_ERRORS[err.code];
    return res.status(pg.status).json({
      error: { code: pg.code, message: pg.message, requestId },
    });
  }

  // Unexpected — log everything
  console.error(
    JSON.stringify({
      level: "error",
      requestId,
      method: req.method,
      path: req.path,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    }),
  );

  return res.status(500).json({
    error: { code: "INTERNAL", message: "Internal server error.", requestId },
  });
}

module.exports = errorHandler;
