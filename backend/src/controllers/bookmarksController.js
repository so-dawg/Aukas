// Bookmarks controller — students save/bookmark opportunities for later reference.
const PATTERNS = require("../utils/patterns");
const { Bookmark, Opportunity, Category, Organization } = require("../models");
const ApiError = require("../utils/ApiError");
const { parsePagination, buildMeta } = require("../utils/pagination");

async function list(req, res) {
  const { page, limit, offset } = parsePagination(req.query);
  const { rows, count } = await Bookmark.findAndCountAll({
    where: { student_id: req.user.id },
    include: [{ model: Opportunity, include: [Category, Organization] }],
    order: [["saved_at", "DESC"]],
    limit,
    offset,
    distinct: true,
  });
  res.json({ data: rows, meta: buildMeta(page, limit, count) });
}

async function create(req, res) {
  const { opportunity_id } = req.body;
  if (!opportunity_id || !PATTERNS.uuid.test(opportunity_id))
    throw ApiError.validation([{ field: "opportunity_id", rule: "format" }]);

  const opp = await Opportunity.findOne({
    where: { id: opportunity_id, deleted_at: null },
  });
  if (!opp) throw ApiError.notFound("Opportunity not found.");

  try {
    const bookmark = await Bookmark.create({
      student_id: req.user.id,
      opportunity_id,
    });
    res.status(201).json({ data: bookmark });
  } catch (err) {
    if (err.code === "23505") throw ApiError.conflict("Already bookmarked.");
    throw err;
  }
}

async function remove(req, res) {
  const { opportunity_id } = req.params;
  await Bookmark.destroy({
    where: { student_id: req.user.id, opportunity_id },
  });
  res.status(204).end();
}

module.exports = { list, create, remove };
