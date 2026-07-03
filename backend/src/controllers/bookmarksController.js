// Bookmarks controller — students save/bookmark opportunities for later reference.
const bookmarkModel = require("../models/bookmarkModel");
const opportunityModel = require("../models/opportunityModel");
const ApiError = require("../utils/ApiError");
const { parsePagination, buildMeta } = require("../utils/pagination");

const UUID_RE =
   /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function list(req, res) {
   const { page, limit, offset } = parsePagination(req.query);
   const { rows, total } = await bookmarkModel.listByStudent(req.user.id, {
      limit,
      offset,
   });
   res.json({ data: rows, meta: buildMeta(page, limit, total) });
}

async function create(req, res) {
   const { opportunity_id } = req.body;
   if (!opportunity_id || !UUID_RE.test(opportunity_id))
      throw ApiError.validation([{ field: "opportunity_id", rule: "format" }]);

   const opp = await opportunityModel.findById(opportunity_id);
   if (!opp) throw ApiError.notFound("Opportunity not found.");

   try {
      const bookmark = await bookmarkModel.create(req.user.id, opportunity_id);
      res.status(201).json({ data: bookmark });
   } catch (err) {
      if (err.code === "23505") throw ApiError.conflict("Already bookmarked.");
      throw err;
   }
}

async function remove(req, res) {
   const { opportunity_id } = req.params;
   await bookmarkModel.remove(req.user.id, opportunity_id);
   res.status(204).end();
}

module.exports = { list, create, remove };
