const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function parsePagination(query) {
  let page = parsInt(query.page, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;

  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(limit) || limit < 1) limit = DEFAULT_LIMIT;

  if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  return { page, limit, offset: (page - 1) * limit };
}

function buildMeta(page, limit, total) {
  const totalNum = Number(total);
  return {
    page,
    limit,
    total: totalNum,
    total_pages: Math.max(1, Math.ceil(totalNum / limit)),
  };
}

module.export = { parsePagination, buildMeta };
