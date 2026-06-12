const PATTERNS = require("../utils/patterns");
const ApiError = require("../utils/ApiError");
const password = require("../utils/password");
const jwt = require("../utils/jwt");
const userModel = require("../models/userModel");

// Client-safe user shape — never includes password_hash.
function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    role: u.role,
    created_at:
      u.created_at instanceof Date ? u.created_at.toISOString() : u.created_at,
  };
}

function validateRegister(body) {
  const b = body || {};
  const details = [];

  if (!["student", "organization"].includes(b.role))
    details.push({ field: "role", rule: "enum" });
  if (typeof b.email !== "string" || !PATTERNS.email.test(b.email))
    details.push({ field: "email", rule: "format" });
  if (typeof b.password !== "string" || !PATTERNS.password.test(b.password))
    details.push({ field: "password", rule: "format" });
  if (typeof b.full_name !== "string" || !PATTERNS.full_name.test(b.full_name))
    details.push({ field: "full_name", rule: "format" });

  const p = b.profile || {};
  if (b.role === "organization") {
    if (typeof p.org_name !== "string" || p.org_name.trim().length < 1)
      details.push({ field: "profile.org_name", rule: "required" });
    if (p.website != null && !PATTERNS.url.test(p.website))
      details.push({ field: "profile.website", rule: "format" });
  }
  if (b.role === "student") {
    if (
      p.year_of_study != null &&
      !(Number.isInteger(p.year_of_study) && p.year_of_study >= 1 && p.year_of_study <= 6)
    )
      details.push({ field: "profile.year_of_study", rule: "range" });
    if (p.resume_url != null && !PATTERNS.url.test(p.resume_url))
      details.push({ field: "profile.resume_url", rule: "format" });
  }

  if (details.length) throw ApiError.validation(details);
}

async function register(req, res) {
  validateRegister(req.body);
  const email = req.body.email.toLowerCase().trim();

  if (await userModel.findActiveByEmail(email))
    throw ApiError.conflict("Email is already registered.");

  const passwordHash = await password.hash(req.body.password);
  const user = await userModel.createWithProfile({
    email,
    passwordHash,
    full_name: req.body.full_name.trim(),
    role: req.body.role,
    profile: req.body.profile || {},
  });

  res.status(201).json({ user: publicUser(user), token: jwt.sign(user) });
}

async function login(req, res) {
  const b = req.body || {};
  const details = [];
  if (typeof b.email !== "string" || !PATTERNS.email.test(b.email))
    details.push({ field: "email", rule: "format" });
  if (typeof b.password !== "string" || b.password.length < 1)
    details.push({ field: "password", rule: "required" });
  if (details.length) throw ApiError.validation(details);

  const user = await userModel.findActiveByEmail(b.email.toLowerCase().trim());
  // identical failure for unknown email AND wrong password → no user enumeration
  const ok = user && (await password.compare(b.password, user.password_hash));
  if (!ok) throw ApiError.unauthenticated("Invalid email or password.");

  res.json({ user: publicUser(user), token: jwt.sign(user) });
}

async function me(req, res) {
  const user = await userModel.findActiveById(req.user.id);
  if (!user) throw ApiError.unauthenticated("Account no longer exists.");

  const profile = await userModel.getProfile(user.id, user.role);
  res.json({ user: { ...publicUser(user), profile } });
}

module.exports = { register, login, me };
