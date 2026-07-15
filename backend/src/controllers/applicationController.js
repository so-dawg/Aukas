// Application controller — students apply and organizations review incoming applications.
const { Application, Opportunity, Organization, Category, Student, User } = require("../models");
const ApiError = require("../utils/ApiError");
const PATTERNS = require("../utils/patterns");
const { parsePagination, buildMeta } = require("../utils/pagination");
const cloudinary = require("../config/cloudinary");

async function cleanupUploadedCv(file) {
  const publicId = file?.filename;
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });
  } catch {
    // Ignore cleanup errors to avoid masking the main response.
  }
}

async function create(req, res) {
  const { student_id, opportunity_id } = req.body;

  if (!student_id || !PATTERNS.uuid.test(student_id)) {
    throw ApiError.validation([{ field: "student_id", rule: "format" }]);
  }
  if (student_id !== req.user.id) {
    throw ApiError.forbidden("You can only submit applications for your own account.");
  }
  if (!opportunity_id || !PATTERNS.uuid.test(opportunity_id)) {
    throw ApiError.validation([{ field: "opportunity_id", rule: "format" }]);
  }

  if (!req.file || !req.file.path) {
    throw ApiError.validation([{ field: "cv", rule: "required" }]);
  }

  const opp = await Opportunity.findOne({
    where: { id: opportunity_id, deleted_at: null },
  });
  if (!opp) throw ApiError.notFound("Opportunity not found.");

  const existing = await Application.findOne({
    where: {
      student_id,
      opportunity_id,
    },
  });
  if (existing) {
    await cleanupUploadedCv(req.file);
    return res.status(200).json({
      message: "Application already submitted.",
      data: existing,
      alreadySubmitted: true,
    });
  }

  const statusEnumValues = Application.getAttributes?.().status?.values || [];
  const pendingStatus = statusEnumValues.includes("Pending")
    ? "Pending"
    : statusEnumValues.includes("pending")
      ? "pending"
      : "clicked";

  let app;
  try {
    app = await Application.create({
      student_id,
      opportunity_id,
      cv_url: req.file.path,
      status: pendingStatus,
    });
  } catch (err) {
    await cleanupUploadedCv(req.file);
    throw err;
  }

  res.status(201).json({
    message: "Application submitted successfully.",
    data: app,
  });
}

async function listMy(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, count } = await Application.findAndCountAll({
    where: { student_id: req.user.id },
    include: [{ model: Opportunity, include: [Organization, Category] }],
    order: [["applied_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });
  res.json({ data: rows, meta: buildMeta(page, limit, count) });
}

async function listReceived(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const { rows, count } = await Application.findAndCountAll({
    where,
    include: [
      {
        model: Opportunity,
        required: true,
        where: {
          organization_id: req.user.id,
          deleted_at: null,
        },
        include: [{ model: Organization }],
      },
      {
        model: Student,
        include: [
          {
            model: User,
            attributes: ["id", "full_name", "email"],
          },
        ],
      },
    ],
    order: [["applied_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  res.json({ data: rows, meta: buildMeta(page, limit, count) });
}

module.exports = { create, listMy, listReceived };
