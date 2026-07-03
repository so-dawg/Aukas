const ApiError = require("../utils/ApiError");
const jwt = require("../utils/jwt");

// Reads "Authorization: Bearer <token>", verifies it, attaches req.user.
// Call before requireRole() — it populates req.user with { id, role }.
function authenticate(req, _res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw ApiError.unauthenticated();
  }

  try {
    const payload = jwt.verify(token);
    req.user = { id: payload.sub, role: payload.role };
  } catch {
    throw ApiError.unauthenticated("Invalid or expired token.");
  }
  next();
}

// Factory that returns middleware — only allows access if req.user.role
// matches one of the given roles. Must come after authenticate().
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) throw ApiError.unauthenticated();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  };
}

module.exports = { authenticate, requireRole };
