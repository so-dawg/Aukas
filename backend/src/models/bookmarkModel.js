// Bookmark model — save/remove favourite opportunities for a student, list with full opp details.
const { QueryTypes } = require("sequelize");
const sequelize = require("../db");
const { SELECT_COLUMNS, mapRow } = require("./opportunityModel");

async function listByStudent(userId, { limit, offset }) {
  const [rows, countResult] = await Promise.all([
    sequelize.query(
      `SELECT b.saved_at, ${SELECT_COLUMNS}
         FROM bookmarks b
         JOIN opportunities o ON o.id = b.opportunity_id
         JOIN categories c ON c.id = o.category_id
         JOIN organizations org ON org.user_id = o.organization_id
        WHERE b.student_id = $1 AND o.deleted_at IS NULL
        ORDER BY b.saved_at DESC
        LIMIT $2 OFFSET $3`,
      { bind: [userId, limit, offset], type: QueryTypes.SELECT },
    ),
    sequelize.query(
      `SELECT COUNT(*) AS total
         FROM bookmarks b
         JOIN opportunities o ON o.id = b.opportunity_id
        WHERE b.student_id = $1 AND o.deleted_at IS NULL`,
      { bind: [userId], type: QueryTypes.SELECT },
    ),
  ]);
  const mapped = rows.map((r) => ({ saved_at: r.saved_at, ...mapRow(r) }));
  return { rows: mapped, total: Number(countResult[0].total) };
}

async function create(studentId, opportunityId) {
  const rows = await sequelize.query(
    `INSERT INTO bookmarks (student_id, opportunity_id) VALUES ($1, $2) RETURNING *`,
    { bind: [studentId, opportunityId], type: QueryTypes.SELECT },
  );
  return rows[0];
}

async function remove(studentId, opportunityId) {
  await sequelize.query(
    `DELETE FROM bookmarks WHERE student_id = $1 AND opportunity_id = $2`,
    { bind: [studentId, opportunityId] },
  );
}

module.exports = { listByStudent, create, remove };
