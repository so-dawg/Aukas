const opportunityModel = require("../models/opportunityModel");
const ApiError = require("../utils/ApiError");
const { parsePagination, buildMeta } = require("../utils/pagination");

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateQuery(query) {
  const details = [];

  if (query.type && !opportunityModel.OPPORTUNITY_TYPES.includes(query.type))
    details.push({ field: "type", rule: "enum" });
  if (query.sort && !Object.keys(opportunityModel.SORTS).includes(query.sort))
    details.push({ field: "sort", rule: "enum" });
  if (query.category_id && !UUID_RE.test(query.category_id))
    details.push({ field: "category_id", rule: "format" });
  if (query.organization_id && !UUID_RE.test(query.organization_id))
    details.push({ field: "organization_id", rule: "format" });
  if (query.deadline_before && !DATE_RE.test(query.deadline_before))
    details.push({ field: "deadline_before", rule: "format" });
  if (query.deadline_after && !DATE_RE.test(query.deadline_after))
    details.push({ field: "deadline_after", rule: "format" });

  if (details.length) throw ApiError.validation(details);
}

async function list(req, res) {
  validateQuery(req.query);

  const { page, limit, offset } = parsePagination(req.query);
  const { rows, total } = await opportunityModel.list({
    q: req.query.q,
    type: req.query.type,
    category_id: req.query.category_id,
    location: req.query.location,
    deadline_before: req.query.deadline_before,
    deadline_after: req.query.deadline_after,
    organization_id: req.query.organization_id,
    sort: req.query.sort,
    limit,
    offset,
  });

  res.json({ data: rows, meta: buildMeta(page, limit, total) });
}

module.exports = { list };