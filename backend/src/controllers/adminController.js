const sequelize = require("../db");
const {
  Opportunity,
  User,
  Student,
  Organization,
  Category,
} = require("../models");
const ApiError = require("../utils/ApiError");
const { parsePagination, buildMeta } = require("../utils/pagination");
const PATTERNS = require("../utils/patterns");

async function listOpportunities(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const where = { deleted_at: null };

  if (req.query.status) where.status = req.query.status;
  if (req.query.type) where.type = req.query.type;
  if (req.query.category_id) where.category_id = req.query.category_id;
  if (req.query.organization_id)
    where.organization_id = req.query.organization_id;

  const { rows, count } = await Opportunity.findAndCountAll({
    where,
    include: [Category, Organization],
    order: [["created_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });
  res.json({ data: rows, meta: buildMeta(page, limit, count) });
}

async function listUsers(req, res) {
  const { page, limit, offset } = parsePagination(req.query);

  // Admin sees ALL users including banned ones
  const where = {};
  if (req.query.role) where.role = req.query.role;
  if (req.query.banned === "true") where.deleted_at = { [require("sequelize").Op.ne]: null };
  else if (req.query.banned !== "all") where.deleted_at = null;

  const { rows, count } = await User.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });
  // fetch profiles for each user
  const data = await Promise.all(
    rows.map(async (u) => {
      let profile = null;
      if (u.role === "student") {
        profile = await Student.findByPk(u.id);
      } else if (u.role === "organization") {
        profile = await Organization.findByPk(u.id);
      }
      return { ...u.toJSON(), profile };
    }),
  );
  res.json({ data, meta: buildMeta(page, limit, count) });
}

async function banUser(req, res) {
  const { id } = req.params;
  const { banned } = req.body;

  if (!PATTERNS.uuid.test(id))
    throw ApiError.validation([{ field: "id", rule: "format" }]);
  if (typeof banned !== "boolean")
    throw ApiError.validation([{ field: "banned", rule: "required" }]);

  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound("User not found.");
  if (user.role === "admin")
    throw ApiError.forbidden("Cannot ban another admin.");

  await User.update(
    { deleted_at: banned ? new Date() : null },
    { where: { id } },
  );

  const updated = await User.findByPk(id);
  res.json({ data: { ...updated.toJSON(), banned: !!updated.deleted_at } });
}

async function verifyOrganization(req, res) {
  const { user_id } = req.params;
  const { verified } = req.body;

  if (!PATTERNS.uuid.test(user_id))
    throw ApiError.validation([{ field: "user_id", rule: "format" }]);
  if (typeof verified !== "boolean")
    throw ApiError.validation([{ field: "verified", rule: "required" }]);

  const org = await Organization.findByPk(user_id);
  if (!org) throw ApiError.notFound("Organization not found.");

  await Organization.update({ verified }, { where: { user_id } });
  const updated = await Organization.findByPk(user_id);
  res.json({ data: updated });
}

module.exports = { listOpportunities, listUsers, verifyOrganization, banUser };
