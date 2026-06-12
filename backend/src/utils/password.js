const bcrypt = require("bcryptjs");

const ROUNDS = 10; // cost factor — higher = slower = harder to brute-force

async function hash(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

async function compare(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

module.exports = { hash, compare };
