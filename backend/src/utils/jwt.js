const jwt = require("jsonwebtoken");

// Read from .env — never hardcode secrets in code
const SECRET = process.env.JWT_SECRET;
// Token expires in 14 days — user has to log in again after that
const EXPIRE_IN = "14d";

// Create a signed JWT for the given user.
// The token carries user.id (as "sub") and user.role — but NOT the password_hash.
function sign(user) {
  return jwt.sign({ sub: user.id, role: user.role }, SECRET, {
    expiresIn: EXPIRE_IN,
  });
}

// Verify and decode a token. Throws if expired or tampered with.
function verify(token) {
  return jwt.verify(token, SECRET);
}

module.exports = {
  sign,
  verify,
};
