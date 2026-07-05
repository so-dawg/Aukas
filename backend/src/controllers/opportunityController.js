const { Op } = require("sequelize");
const sequelize = require("../db");
const { Opportunity, Category, Organization } = require("../models");
const PATTERNS = require("../utils/patterns");
const ApiError = require("../utils/ApiError");
const { parsePagination, buildMeta } = require("../utils/pagination");

const OPPORTUNITY_TYPES = [
  "internship",
  "job",
  "scholarship",
  "volunteer",
  "competition",
];

const SORT_MAP = {
  deadline_asc: [["deadline", "ASC"]],
  deadline_desc: [["deadline", "DESC"]],
  newest: [["created_at", "DESC"]],
};

function isValidDate(s) {
  return DATE_RE.test(s) && !Number.isNaN(Date.parse(s));
}

function validateQuery(query) {
  const details = [];

  if (query.type && !OPPORTUNITY_TYPES.includes(query.type))
    details.push({ field: "type", rule: "enum" });
  if (query.sort && !Object.keys(SORT_MAP).includes(query.sort))
    details.push({ field: "sort", rule: "enum" });
  if (query.category_id && !PATTERNS.uuid.test(query.category_id))
    details.push({ field: "category_id", rule: "format" });
  if (query.organization_id && !PATTERNS.uuid.test(query.organization_id))
    details.push({ field: "organization_id", rule: "format" });
  if (query.deadline_before && !DATE_RE.test(query.deadline_before))
    details.push({ field: "deadline_before", rule: "format" });
  if (query.deadline_after && !DATE_RE.test(query.deadline_after))
    details.push({ field: "deadline_after", rule: "format" });

  if (details.length) throw ApiError.validation(details);
}

function buildWhere(filters) {
  const where = { deleted_at: null };

  if (!filters.allStatuses) where.status = "approved";

  if (filters.q) {
    where[Op.and] = sequelize.literal(
      `to_tsvector('simple', "Opportunity"."title" || ' ' || "Opportunity"."description") @@ plainto_tsquery('simple', ${sequelize.escape(filters.q)})`,
    );
  }
  if (filters.type) where.type = filters.type;
  if (filters.category_id) where.category_id = filters.category_id;
  if (filters.organization_id) where.organization_id = filters.organization_id;
  if (filters.status) where.status = filters.status;
  if (filters.location) {
    where.location = { [Op.iLike]: `%${filters.location}%` };
  }
  if (filters.deadline_before) {
    where.deadline = { ...where.deadline, [Op.lte]: filters.deadline_before };
  }
  if (filters.deadline_after) {
    where.deadline = { ...where.deadline, [Op.gte]: filters.deadline_after };
  }

  return where;
}

async function list(req, res) {
  validateQuery(req.query);

  const { page, limit, offset } = parsePagination(req.query);
  const where = buildWhere(req.query);
  const order = SORT_MAP[req.query.sort] || SORT_MAP.deadline_asc;

  const { rows, count } = await Opportunity.findAndCountAll({
    where,
    include: [Category, Organization],
    order,
    limit,
    offset,
    distinct: true,
  });

  res.json({ data: rows, meta: buildMeta(page, limit, count) });
}

// Statuses any unauthenticated visitor is allowed to see.
const PUBLIC_STATUSES = ["approved", "expired"];

async function getById(req, res) {
  const { id } = req.params;

  // A malformed id can't exist; 404 (not 400) avoids leaking what a valid id
  // would look like, and keeps Postgres from erroring on the uuid cast.
  if (!PATTERNS.uuid.test(id))
    throw ApiError.notFound("Opportunity not found.");

  const opportunity = await Opportunity.findOne({
    where: { id, deleted_at: null },
    include: [Category, Organization],
  });
  if (!opportunity) throw ApiError.notFound("Opportunity not found.");

  // Public visitors only see approved/expired rows. Draft/pending/rejected
  // are hidden as 404 so their existence isn't leaked.
  if (!PUBLIC_STATUSES.includes(opportunity.status))
    throw ApiError.notFound("Opportunity not found.");

  res.json({ data: opportunity });
}

function validateCreate(body) {
  const b = body || {};
  const details = [];

  if (!b.category_id || !PATTERNS.uuid.test(b.category_id))
    details.push({ field: "category_id", rule: "format" });
  if (
    typeof b.title !== "string" ||
    b.title.trim().length < 1 ||
    b.title.length > 255
  )
    details.push({ field: "title", rule: "length" });
  if (typeof b.description !== "string" || b.description.trim().length < 1)
    details.push({ field: "description", rule: "required" });
  if (
    b.location != null &&
    (typeof b.location !== "string" || b.location.length > 150)
  )
    details.push({ field: "location", rule: "length" });
  if (b.deadline != null && !isValidDate(b.deadline))
    details.push({ field: "deadline", rule: "format" });

  if (details.length) throw ApiError.validation(details);
}

async function create(req, res) {
  validateCreate(req.body);

  // role is already 'organization' (requireRole); verified is data, so check it.
  const org = await Organization.findByPk(req.user.id);
  if (!org || !org.verified)
    throw ApiError.forbidden(
      "Only verified organizations can post opportunities.",
    );

  const created = await Opportunity.create({
    organization_id: req.user.id, // from the token, never the body
    category_id: req.body.category_id,
    title: req.body.title.trim(),
    description: req.body.description,
    location: req.body.location ?? null,
    deadline: req.body.deadline ?? null,
  });

  // Re-fetch with includes to return the full object
  const withIncludes = await Opportunity.findOne({
    where: { id: created.id },
    include: [Category, Organization],
  });

  res.status(201).json({ data: withIncludes });
}

const EDITABLE_FIELDS = [
  "title",
  "description",
  "category_id",
  "location",
  "deadline",
];

function validateUpdate(body) {
  const b = body || {};
  if (!EDITABLE_FIELDS.some((f) => b[f] !== undefined))
    throw ApiError.validation(
      [{ field: "body", rule: "required" }],
      "No editable fields provided.",
    );

  const details = [];
  if (b.category_id !== undefined && !PATTERNS.uuid.test(b.category_id))
    details.push({ field: "category_id", rule: "format" });
  if (
    b.title !== undefined &&
    (typeof b.title !== "string" ||
      b.title.trim().length < 1 ||
      b.title.length > 255)
  )
    details.push({ field: "title", rule: "length" });
  if (
    b.description !== undefined &&
    (typeof b.description !== "string" || b.description.trim().length < 1)
  )
    details.push({ field: "description", rule: "required" });
  if (
    b.location !== undefined &&
    b.location !== null &&
    (typeof b.location !== "string" || b.location.length > 150)
  )
    details.push({ field: "location", rule: "length" });
  if (
    b.deadline !== undefined &&
    b.deadline !== null &&
    !isValidDate(b.deadline)
  )
    details.push({ field: "deadline", rule: "format" });

  if (details.length) throw ApiError.validation(details);
}

async function update(req, res) {
  validateUpdate(req.body);

  const { id } = req.params;
  if (!PATTERNS.uuid.test(id))
    throw ApiError.notFound("Opportunity not found.");

  const existing = await Opportunity.findOne({
    where: { id, deleted_at: null },
    include: [Organization],
  });
  if (!existing) throw ApiError.notFound("Opportunity not found.");

  if (existing.organization.user_id !== req.user.id)
    throw ApiError.forbidden("You do not own this opportunity.");

  // approved/expired postings are frozen — edit means "create a new one"
  if (["approved", "expired"].includes(existing.status))
    throw ApiError.conflict(
      "Approved or expired opportunities cannot be edited.",
    );

  const fields = {};
  for (const f of EDITABLE_FIELDS) {
    if (req.body[f] !== undefined)
      fields[f] = f === "title" ? req.body[f].trim() : req.body[f];
  }
  // editing a pending/rejected posting sends it back to draft (state-diagram "edit")
  if (["pending", "rejected"].includes(existing.status))
    fields.status = "draft";

  await Opportunity.update(fields, { where: { id, deleted_at: null } });
  const updated = await Opportunity.findOne({
    where: { id, deleted_at: null },
    include: [Category, Organization],
  });
  res.json({ data: updated });
}

async function remove(req, res) {
  const { id } = req.params;
  if (!PATTERNS.uuid.test(id))
    throw ApiError.notFound("Opportunity not found.");

  const existing = await Opportunity.findOne({
    where: { id, deleted_at: null },
    include: [Organization],
  });
  if (!existing) throw ApiError.notFound("Opportunity not found.");

  if (
    req.user.role === "organization" &&
    existing.organization.user_id !== req.user.id
  )
    throw ApiError.forbidden("You do not own this opportunity.");

  await Opportunity.update(
    { deleted_at: new Date() },
    { where: { id, deleted_at: null } },
  );
  res.status(204).end();
}

const ORG_TRANSITIONS = {
  draft: ["pending"], // submit
  pending: ["draft"], // edit (reverts to draft)
  rejected: ["draft"], // edit (after rejection)
};

const ADMIN_TRANSITIONS = {
  pending: ["approved", "rejected"],
};

async function updateStatus(req, res) {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!PATTERNS.uuid.test(id))
    throw ApiError.notFound("Opportunity not found.");
  if (!status || typeof status !== "string")
    throw ApiError.validation([{ field: "status", rule: "required" }]);

  const VALID = ["draft", "pending", "approved", "rejected", "expired"];
  if (!VALID.includes(status))
    throw ApiError.validation([{ field: "status", rule: "enum" }]);

  const existing = await Opportunity.findOne({
    where: { id, deleted_at: null },
    include: [Organization],
  });
  if (!existing) throw ApiError.notFound("Opportunity not found.");

  const allowed =
    req.user.role === "admin"
      ? ADMIN_TRANSITIONS
      : req.user.role === "organization"
        ? ORG_TRANSITIONS
        : null;

  if (!allowed || !allowed[existing.status]?.includes(status))
    throw ApiError.conflict(
      `Cannot transition from ${existing.status} to ${status}.`,
      "ILLEGAL_TRANSITION",
    );

  if (
    req.user.role === "organization" &&
    existing.organization.user_id !== req.user.id
  )
    throw ApiError.forbidden("You do not own this opportunity.");

  const fields = { status };
  if (status === "approved") fields.approved_by = req.user.id;

  await Opportunity.update(fields, { where: { id, deleted_at: null } });
  const updated = await Opportunity.findOne({
    where: { id, deleted_at: null },
    include: [Category, Organization],
  });
  res.json({ data: updated });
}

module.exports = { list, getById, create, update, remove, updateStatus };
