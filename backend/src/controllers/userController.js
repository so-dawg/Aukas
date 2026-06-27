const PATTERNS = require("../utils/patterns");
const ApiError = require("../utils/ApiError");
const password = require("../utils/password");
const userModel = require("../models/userModel");
const studentModel = require("../models/studentModel");

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

async function updateMe(req, res) {
  const b = req.body;
  const details = [];

  if (b.full_name !== undefined && !PATTERNS.full_name.test(b.full_name))
    details.push({ field: "full_name", rule: "format" });
  if (b.email !== undefined && !PATTERNS.email.test(b.email))
    details.push({ field: "email", rule: "format" });
  if (b.password !== undefined && !PATTERNS.password.test(b.password))
    details.push({ field: "password", rule: "format" });

  if (details.length) throw ApiError.validation(details);

  const fields = {};
  if (b.full_name) fields.full_name = b.full_name.trim();
  if (b.email) {
    const newEmail = b.email.toLowerCase().trim();
    if (newEmail !== req.user.email) {
      const existing = await userModel.findActiveByEmail(newEmail);
      if (existing) throw ApiError.conflict("Email is already in use.");
    }
    fields.email = newEmail;
  }
  if (b.password) fields.password_hash = await password.hash(b.password);

  if (Object.keys(fields).length === 0)
    throw ApiError.validation(
      [{ field: "body", rule: "required" }],
      "No editable fields provided.",
    );

  const updated = await userModel.update(req.user.id, fields);
  res.json({ data: publicUser(updated) });
}

async function deleteMe(req, res) {
  await userModel.remove(req.user.id);
  res.status(204).end();
}

async function getUser(req, res) {
  const { id } = req.params;
  if (!PATTERNS.uuid.test(id)) throw ApiError.notFound("User not found.");

  const user = await userModel.findActiveById(id);
  if (!user) throw ApiError.notFound("User not found.");

  const profile = await userModel.getProfile(user.id, user.role);
  res.json({ data: { ...publicUser(user), profile } });
}

async function updateStudentProfile(req, res) {
  const b = req.body;
  const details = [];

  if (
    b.year_of_study !== undefined &&
    (!Number.isInteger(b.year_of_study) ||
      b.year_of_study < 1 ||
      b.year_of_study > 6)
  )
    details.push({ field: "year_of_study", rule: "range" });
  if (
    b.resume_url !== undefined &&
    b.resume_url !== null &&
    !PATTERNS.url.test(b.resume_url)
  )
    details.push({ field: "resume_url", rule: "format" });

  if (details.length) throw ApiError.validation(details);

  const fields = {};
  for (const f of ["university", "major", "year_of_study", "resume_url"]) {
    if (b[f] !== undefined) fields[f] = b[f];
  }

  if (Object.keys(fields).length === 0)
    throw ApiError.validation(
      [{ field: "body", rule: "required" }],
      "No editable fields provided.",
    );

  const updated = await studentModel.update(req.user.id, fields);
  res.json({ data: updated });
}

module.exports = { updateMe, deleteMe, getUser, updateStudentProfile };
