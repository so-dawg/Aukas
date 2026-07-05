// Application controller — students apply to opportunities and view their sent applications.
const { Application, Opportunity, Organization } = require("../models");
const ApiError = require("../utils/ApiError");
const crypto = require("crypto");
const { parsePagination, buildMeta } = require("../utils/pagination");

async function create(req, res) {
  const { opportunity_id } = req.body;
  if (!opportunity_id || !crypto.validateUUID(opportunity_id))
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

module.exports = { create, listMy };
