// Organization controller — update org profile and list own opportunities.
const PATTERNS = require("../utils/patterns");
const { Organization, Opportunity, Category, Application } = require("../models");
const ApiError = require("../utils/ApiError");
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
  await Organization.update(fields, { where: { user_id: req.user.id } });
  const org = await Organization.findByPk(req.user.id);
  res.json({ data: org });
}

async function listMyOpportunities(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { organization_id: req.user.id, deleted_at: null };
  if (req.query.status) where.status = req.query.status;

  const { rows, count } = await Opportunity.findAndCountAll({
    where,
    include: [Category],
    order: [["created_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });

  const opportunityIds = rows.map((row) => row.id);
  const applicationCounts = opportunityIds.length
    ? await Application.findAll({
        attributes: [
          "opportunity_id",
          [Opportunity.sequelize.fn("COUNT", Opportunity.sequelize.col("id")), "applications_count"],
        ],
        where: { opportunity_id: opportunityIds },
        group: ["opportunity_id"],
        raw: true,
      })
    : [];

  const countsByOpportunityId = new Map(
    applicationCounts.map((item) => [
      item.opportunity_id,
      Number(item.applications_count) || 0,
    ]),
  );

  const data = rows.map((row) => ({
    ...row.toJSON(),
    applications_count: countsByOpportunityId.get(row.id) || 0,
  }));

  res.json({ data, meta: buildMeta(page, limit, count) });
}

module.exports = { updateProfile, listMyOpportunities };
