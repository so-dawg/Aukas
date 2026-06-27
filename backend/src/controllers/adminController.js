const opportunityModel = require("../models/opportunityModel");
const userModel = require("../models/userModel");
const organizationModel = require("../models/organizationModel");
const ApiError = require("../utils/ApiError");
const { parsePagination, buildMeta } = require("../utils/pagination");

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function listOpportunities(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, total } = await opportunityModel.list({
    q: req.query.q,
    type: req.query.type,
    category_id: req.query.category_id,
    location: req.query.location,
    deadline_before: req.query.deadline_before,
    deadline_after: req.query.deadline_after,
    organization_id: req.query.organization_id,
    status: req.query.status, // defaults to pending in buildWhere? No — admin wants all
    sort: req.query.sort,
    allStatuses: true,
    limit,
    offset,
  });
  res.json({ data: rows, meta: buildMeta(page, limit, total) });
}

async function listUsers(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, total } = await userModel.listUsers({
    role: req.query.role,
    limit,
    offset,
  });
  // fetch profiles for each user
  const data = await Promise.all(
    rows.map(async (u) => {
      const profile = await userModel.getProfile(u.id, u.role);
      return { ...u, profile };
    }),
  );
  res.json({ data, meta: buildMeta(page, limit, total) });
}

async function verifyOrganization(req, res) {
  const { user_id } = req.params;
  const { verified } = req.body;

  if (!UUID_RE.test(user_id))
    throw ApiError.validation([{ field: "user_id", rule: "format" }]);
  if (typeof verified !== "boolean")
    throw ApiError.validation([{ field: "verified", rule: "required" }]);

  const org = await organizationModel.findByUserId(user_id);
  if (!org) throw ApiError.notFound("Organization not found.");

  const updated = await organizationModel.update(user_id, { verified });
  res.json({ data: updated });
}

module.exports = { listOpportunities, listUsers, verifyOrganization };
