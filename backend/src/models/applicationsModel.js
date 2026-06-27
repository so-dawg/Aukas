const db = require("../db");

async function create(studentId, opportunityId) {
  const { rows } = await db.query(
    `INSERT INTO applications (student_id, opportunity_id) VALUES ($1, $2)
     RETURNING id, student_id, opportunity_id, status, applied_at`,
    [studentId, opportunityId],
  );
  return rows[0];
}

async function listByStudent(studentId, { limit, offset }) {
  const { rows } = await db.query(
    `SELECT a.id, a.student_id, a.opportunity_id, a.status, a.applied_at,
       o.title AS opportunity_title, o.type AS opportunity_type,
       to_char(o.deadline, 'YYYY-MM-DD') AS opportunity_deadline,
       org.org_name AS organization_name
     FROM applications a
     JOIN opportunities o ON o.id = a.opportunity_id
     JOIN organizations org ON org.user_id = o.organization_id
     WHERE a.student_id = $1
     ORDER BY a.applied_at DESC
     LIMIT $2 OFFSET $3`,
    [studentId, limit, offset],
  );
  const countResult = await db.query(
    `SELECT COUNT(*) AS total FROM applications WHERE student_id = $1`,
    [studentId],
  );
  return { rows, total: Number(countResult.rows[0].total) };
}

module.exports = { create, listByStudent };
