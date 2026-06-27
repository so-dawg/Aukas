const db = require("../db");
const { SELECT_COLUMNS, mapRow } = require("./opportunityModel");

async function listByStudent(userId, { limit, offset }) {
  const { rows } = await db.query(
    `SELECT b.saved_at, ${SELECT_COLUMNS}
       FROM bookmarks b
       JOIN opportunities o ON o.id = b.opportunity_id
       JOIN categories c ON c.id = o.category_id
       JOIN organizations org on org.user_id = o.organization_id
      WHERE b.student_id = $1 AND o.deleted_at IS NULL
      ORDER BY b.saved_at DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  const mapped = rows.map((r) => ({
    saved_at: r.saved_at,
    ...mapRow(r),
  }));
  return { rows: mapped };
}

async function create(studentId, opportunityId) {
  const { rows } = await db.query(
    `INSERT INTO bookmarks (student_id, opportunity_id) VALUES ($1, $2) RETURNING *`,
    [studentId, opportunityId],
  );
  return rows[0];
}

async function remove(studentId, opportunityId) {
  await db.query(
    `DELETE FROM bookmarks WHERE student_id = $1 AND opportunity_id = $2`,
    [studentId, opportunityId],
  );
}

module.exports = { listByStudent, create, remove };
