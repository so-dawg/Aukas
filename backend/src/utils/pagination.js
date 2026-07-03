// Default items per page, and hard cap so users can't request 10k rows.
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

// Extract page & limit from query params, validate, compute offset for SQL.
function parsePagination(query) {
  let page = parseInt(query.page, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;

  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_LIMIT;

  if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  return { page, limit, offset: (page - 1) * limit };
}

// Build response metadata object that tells the frontend what page we're on.
function buildMeta(page, limit, total) {
  const totalNum = Number(total);
  return {
    page,
    limit,
    total: totalNum,
    total_pages: Math.max(1, Math.ceil(totalNum / limit)),
  };
}

module.exports = { parsePagination, buildMeta };
