const PATTERNS = require("../utils/patterns");
const ApiError = require("../utils/ApiError");
const organizationModel = require("../models/organizationModel");
const opportunityModel = require("../models/opportunityModel");
const { parsePagination, buildMeta } = require("../utils/pagination");

const UPDATABLE_FIELDS = ["org_name", "website", "description"];

function validateUpdate(body) {
  const b = body || {};
  const details = [];
  if (!UPDATABLE_FIELDS.some((f) => b[f] !== undefined))
    throw ApiError.validation(
      [{ field: "body", rule: "required" }],
      "No editable fields provided.",
    );

  if (
    b.org_name !== undefined &&
    (typeof b.org_name !== "string" || b.org_name.trim().length < 1)
  )
    details.push({ field: "org_name", rule: "required" });
  if (
    b.website !== undefined &&
    b.website !== null &&
    !PATTERNS.url.test(b.website)
  )
    details.push({ field: "website", rule: "format" });
  if (
    b.description !== undefined &&
    (typeof b.description !== "string" || b.description.trim().length < 1)
  )
    details.push({ field: "description", rule: "required" });

  if (details.length) throw ApiError.validation(details);
}

async function updateProfile(req, res) {
  validateUpdate(req.body);
  const fields = {};
  for (const f of UPDATABLE_FIELDS) {
    if (req.body[f] !== undefined)
      fields[f] = f === "org_name" ? req.body[f].trim() : req.body[f];
  }
  const org = await organizationModel.update(req.user.id, fields);
  res.json({ data: org });
}

async function listMyOpportunities(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, total } = await opportunityModel.list({
    organization_id: req.user.id,
    allStatuses: true,
    status: req.query.status,
    limit,
    offset,
  });
  res.json({ data: rows, meta: buildMeta(page, limit, total) });
}

module.exports = { updateProfile, listMyOpportunities };
