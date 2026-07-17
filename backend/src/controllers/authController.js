const PATTERNS = require("../utils/patterns");
const ApiError = require("../utils/ApiError");
const password = require("../utils/password");
const jwt = require("../utils/jwt");
const { User, Student, Organization } = require("../models");

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
    if (p.website && !PATTERNS.url.test(p.website))
      details.push({ field: "profile.website", rule: "format" });
  }
  if (b.role === "student") {
    if (
      p.year_of_study != null &&
      !(
        Number.isInteger(p.year_of_study) &&
        p.year_of_study >= 1 &&
        p.year_of_study <= 6
      )
    )
      details.push({ field: "profile.year_of_study", rule: "range" });
    if (p.resume_url && !PATTERNS.url.test(p.resume_url))
      details.push({ field: "profile.resume_url", rule: "format" });
  }

  if (details.length) throw ApiError.validation(details);
}

async function register(req, res) {
  validateRegister(req.body);
  const email = req.body.email.toLowerCase().trim();

  const existing = await User.findOne({ where: { email, deleted_at: null } });
  if (existing) throw ApiError.conflict("Email is already registered.");

  const passwordHash = await password.hash(req.body.password);
  const full_name = req.body.full_name.trim();
  const role = req.body.role;
  const profile = req.body.profile || {};

  const user = await User.sequelize.transaction(async (t) => {
    const u = await User.create(
      { email, password_hash: passwordHash, full_name, role },
      { transaction: t },
    );

    if (role === "student") {
      await Student.create(
        {
          user_id: u.id,
          university: profile.university ?? null,
          major: profile.major ?? null,
          year_of_study: profile.year_of_study ?? null,
          resume_url: profile.resume_url ?? null,
        },
        { transaction: t },
      );
    } else if (role === "organization") {
      await Organization.create(
        {
          user_id: u.id,
          org_name: profile.org_name,
          website: profile.website ?? null,
          description: profile.description ?? null,
        },
        { transaction: t },
      );
    }

    return u;
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

  const user = await User.findOne({
    where: { email: b.email.toLowerCase().trim(), deleted_at: null },
  });
  // identical failure for unknown email AND wrong password → no user enumeration
  const ok = user && (await password.compare(b.password, user.password_hash));
  if (!ok) throw ApiError.unauthenticated("Invalid email or password.");

  res.json({ user: publicUser(user), token: jwt.sign(user) });
}

async function me(req, res) {
  const user = await User.findOne({
    where: { id: req.user.id, deleted_at: null },
  });
  if (!user) throw ApiError.unauthenticated("Account no longer exists.");

  let profile = null;
  if (user.role === "student") {
    profile = await Student.findByPk(user.id);
  } else if (user.role === "organization") {
    profile = await Organization.findByPk(user.id);
  }
  res.json({ user: { ...publicUser(user), profile } });
}

module.exports = { register, login, me };
