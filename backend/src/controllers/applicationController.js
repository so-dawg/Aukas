// Application controller — students apply and organizations review incoming applications.
const { Application, Opportunity, Organization, Student, User } = require("../models");
const ApiError = require("../utils/ApiError");
const PATTERNS = require("../utils/patterns");
const { parsePagination, buildMeta } = require("../utils/pagination");

async function create(req, res) {
  const { opportunity_id } = req.body;
  if (!opportunity_id || !PATTERNS.uuid.test(opportunity_id))
    throw ApiError.validation([{ field: "opportunity_id", rule: "format" }]);

  const opp = await Opportunity.findOne({
    where: { id: opportunity_id, deleted_at: null },
  });
  if (!opp) throw ApiError.notFound("Opportunity not found.");

  const app = await Application.create({
    student_id: req.user.id,
    opportunity_id,
  });
  res.status(201).json({ data: app });
}

async function listMy(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, count } = await Application.findAndCountAll({
    where: { student_id: req.user.id },
    include: [{ model: Opportunity, include: [Organization] }],
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
