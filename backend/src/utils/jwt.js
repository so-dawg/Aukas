const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;
const EXPIRE_IN = "7d"; //var to init for token to expire

function sign(user) {
  return jwt.sign({ sub: user.id, role: user.role }, SECRET, {
    expiresIn: EXPIRE_IN,
  });
}

function verify(token) {
  return jwt.verify(token, SECRET); //for throw a invalid or expired
}

module.exports = {
  sign,
  verify,
};
