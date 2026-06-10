class ApiError extends Error {
  // why objects bcuz u can throw it anywhere
  // Constructor for Api error
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    if (details) this.details = details;
  }

  toResponse() {
    const error = { code: this.code, message: this.message };
    if (this.details) error.details = this.details;
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

module.export = ApiError;
