// User controller — self-service profile updates, account deletion, admin user lookup.
const PATTERNS = require("../utils/patterns");
const ApiError = require("../utils/ApiError");
const password = require("../utils/password");
const { User, Student, Organization } = require("../models");
const upload = require("../config/multer");

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
      const existing = await User.findOne({
        where: { email: newEmail, deleted_at: null },
      });
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

  await User.update(fields, { where: { id: req.user.id, deleted_at: null } });
  const updated = await User.findOne({
    where: { id: req.user.id, deleted_at: null },
  });
  res.json({ data: publicUser(updated) });
}

async function deleteMe(req, res) {
  await User.update(
    { deleted_at: new Date() },
    { where: { id: req.user.id, deleted_at: null } },
  );
  res.status(204).end();
}

async function getUser(req, res) {
  const { id } = req.params;
  if (!PATTERNS.uuid.test(id)) throw ApiError.notFound("User not found.");

  const user = await User.findOne({ where: { id, deleted_at: null } });
  if (!user) throw ApiError.notFound("User not found.");

  let profile = null;
  if (user.role === "student") {
    profile = await Student.findByPk(user.id);
  } else if (user.role === "organization") {
    profile = await Organization.findByPk(user.id);
  }
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

  await Student.update(fields, { where: { user_id: req.user.id } });
  const updated = await Student.findByPk(req.user.id);
  res.json({ data: updated });
}

async function uploadResume(req, res) {
  if (!req.file) throw ApiError.validation([], "No file provided.");

  const url = req.file.path;
  await Student.update({ resume_url: url }, { where: { user_id: req.user.id } });
  res.json({ data: { resume_url: url } });
}

module.exports = { updateMe, deleteMe, getUser, updateStudentProfile, uploadResume };
