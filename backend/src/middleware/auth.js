const ApiError = require("../utils/ApiError");
const jwt = require("../utils/jwt");

// Reads "Authorization: Bearer <token>", verifies it, attaches req.user.
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

// Guard for one or more roles. Use AFTER authenticate.
function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) throw ApiError.unauthenticated();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  };
}

module.exports = { authenticate, requireRole };
