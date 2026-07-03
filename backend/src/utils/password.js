const bcrypt = require("bcryptjs");

// Cost factor — higher = slower = harder to brute-force.
// 10 is the standard minimum (takes ~50-100ms per hash).
const ROUNDS = 10;

// Hash a plain-text password before storing it.
// Returns a 60-character string: $2b$10$<salt><hash>.
async function hash(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

// Compare a plain-text password against a stored hash.
// Returns true if it matches, false otherwise.
async function compare(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

module.exports = { hash, compare };
