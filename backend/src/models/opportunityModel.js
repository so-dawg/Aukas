const db = require("../db");

const OPPORTUNITY_TYPES = [
  "internship",
  "job",
  "scholarship",
  "volunteer",
  "competition",
];

const SORTS = {
  deadline_asc: "o.deadline ASC NULLS LAST",
  deadline_desc: "o.deadline DESC NULLS LAST",
  newest: "o.created_at DESC",
};

const SELECT_COLUMNS = `o.id, o.title, o.description, o.type, o.location, o.status, o.approved_by,
  to_char(o.deadline, 'YYYY-MM-DD') AS deadline,
  o.created_at,
  c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
  org.user_id AS organization_user_id,
  org.org_name AS organization_name,
  org.verified AS organization_verified`;

const FROM_JOINS = `
  FROM opportunities o
  JOIN categories    c   ON c.id = o.category_id
  JOIN organizations org ON org.user_id = o.organization_id
`;

function mapRow(row, { detail = false } = {}) {
  const item = {
    id: row.id,
    title: row.title,
    type: row.type,
    category: {
      id: row.category_id,
      name: row.category_name,
      slug: row.category_slug,
    },
    organization: {
      user_id: row.organization_user_id,
      org_name: row.organization_name,
      verified: row.organization_verified,
    },
    location: row.location,
    deadline: row.deadline,
    status: row.status,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
  };
  if (detail) {
    item.description = row.description;
    item.approved_by = row.approved_by;
  }
  return item;
}

function buildWhere(filters) {
  const where = ["o.deleted_at IS NULL", "o.status = 'approved'"];
  const params = [];

  const add = (value, clause) => {
    params.push(value);
    where.push(clause(params.length));
  };

  if (filters.q)
    add(
      filters.q,
      (n) =>
        `to_tsvector('simple', o.title || ' ' || o.description) @@ plainto_tsquery('simple', $${n})`,
    );
  if (filters.type) add(filters.type, (n) => `o.type = $${n}`);
  if (filters.category_id)
    add(filters.category_id, (n) => `o.category_id = $${n}`);
  if (filters.location)
    add(filters.location, (n) => `o.location ILIKE '%' || $${n} || '%'`);
  if (filters.deadline_before)
    add(filters.deadline_before, (n) => `o.deadline <= $${n}`);
  if (filters.deadline_after)
    add(filters.deadline_after, (n) => `o.deadline >= $${n}`);
  if (filters.organization_id)
    add(filters.organization_id, (n) => `o.organization_id = $${n}`);

  return { whereSql: where.join(" AND "), params };
}

async function list(filters) {
  const { whereSql, params } = buildWhere(filters);
  const orderBy = SORTS[filters.sort] || SORTS.deadline_asc;

  const rowsSql = `
    SELECT ${SELECT_COLUMNS}
    ${FROM_JOINS}
    WHERE ${whereSql}
    ORDER BY ${orderBy}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  const countSql = `SELECT COUNT(*) AS total ${FROM_JOINS} WHERE ${whereSql}`;

  const [rowsResult, countResult] = await Promise.all([
    db.query(rowsSql, [...params, filters.limit, filters.offset]),
    db.query(countSql, params),
  ]);

  return {
    rows: rowsResult.rows.map((r) => mapRow(r)),
    total: Number(countResult.rows[0].total),
  };
}

// Fetch a single (non-soft-deleted) opportunity of any status.
// Returns the detail-shaped object, or null if no such row exists.
async function findById(id) {
  const sql = `
    SELECT ${SELECT_COLUMNS}
    ${FROM_JOINS}
    WHERE o.id = $1 AND o.deleted_at IS NULL
  `;
  const { rows } = await db.query(sql, [id]);
  if (rows.length === 0) return null;
  return mapRow(rows[0], { detail: true });
}

async function create({
  organization_id,
  category_id,
  title,
  description,
  location,
  deadline,
}) {
  //from the category slog , so we don't insert it
  const { rows } = await db.query(
    `INSERT INTO opportunities (organization_id, category_id, title, description, location, deadline, status) VALUES ($1, $2, $3, $4, $5, $6, 'draft') RETURNING id`,
    [
      organization_id,
      category_id,
      title,
      description,
      location ?? null,
      deadline ?? null,
    ],
  );
  return findById(rows[0].id); //re-fetch so the response is the joined detail shape
}

const UPDATABLE = [
  "title",
  "description",
  "category_id",
  "location",
  "deadline",
  "status",
];

async function update(id, fields) {
  const cols = Object.keys(fields).filter((c) => UPDATABLE.includes(c));
  if (cols.length === 0) return findById(id);

  const set = colls.map((c, i) => `${c} = $${i + 1}`);
  const params = col.map((c) => fields[c]);
  params.push(id);

  await db.query(
    `UPDATE opportunities SET ${set.join(", ")} WHERE id = $${params.length} AND deleted_at IS NULL`,
    params,
  );
  return findById(id);
}
module.exports = {
  list,
  findById,
  mapRow,
  create,
  update,
  OPPORTUNITY_TYPES,
  SORTS,
};
