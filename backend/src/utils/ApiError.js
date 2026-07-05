// Custom error class that carries HTTP status + error code.
// Throw anywhere — the global error handler catches it and sends a JSON response.
// Use static methods for common cases: validation(), notFound(), forbidden(), etc.
class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    if (details) this.details = details;
  }

  toResponse(requestId) {
    const error = { code: this.code, message: this.message };
    if (this.details) error.details = this.details;
    if (requestId) error.requestId = requestId;
    return { error };
  }

  static validation(details, message = "Request validation failed") {
    return new ApiError(400, "VALIDATION_FAILED", message, details);
  }
  static unauthenticated(message = "Authentication required") {
    return new ApiError(401, "UNAUTHENTICATED", message);
  }
  static forbidden(message = "You are not allowed to perform this action.") {
    return new ApiError(403, "FORBIDDEN", message);
  }
  static notFound(message = "Resource not found.") {
    return new ApiError(404, "NOT_FOUND", message);
  }
  static conflict(message = "Conflict", code = "CONFLICT") {
    return new ApiError(409, code, message);
  }
  static internal(message = "Internal server error.") {
    return new ApiError(500, "INTERNAL", message);
  }
}

module.exports = ApiError;
