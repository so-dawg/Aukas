const applicationModel = require("../models/applicationModel");
const opportunityModel = require("../models/opportunityModel");
const ApiError = require("../utils/ApiError");
const { parsePagination, buildMeta } = require("../utils/pagination");

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function create(req, res) {
  const { opportunity_id } = req.body;
  if (!opportunity_id || !UUID_RE.test(opportunity_id))
    throw ApiError.validation([{ field: "opportunity_id", rule: "format" }]);

  const opp = await opportunityModel.findById(opportunity_id);
  if (!opp) throw ApiError.notFound("Opportunity not found.");

  const app = await applicationModel.create(req.user.id, opportunity_id);
  res.status(201).json({ data: app });
}

async function listMy(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, total } = await applicationModel.listByStudent(req.user.id, {
    limit,
    offset,
  });
  res.json({ data: rows, meta: buildMeta(page, limit, total) });
}

module.exports = { create, listMy };
