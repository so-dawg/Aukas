// Applications model — student applies to an opportunity, lists their submitted applications.
const { QueryTypes } = require("sequelize");
const sequelize = require("../db");

async function create(studentId, opportunityId) {
  const rows = await sequelize.query(
    `INSERT INTO applications (student_id, opportunity_id) VALUES ($1, $2)
     RETURNING id, student_id, opportunity_id, status, applied_at`,
    { bind: [studentId, opportunityId], type: QueryTypes.SELECT },
  );
  return rows[0];
}

async function listByStudent(studentId, { limit, offset }) {
  const rows = await sequelize.query(
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
    { bind: [studentId, limit, offset], type: QueryTypes.SELECT },
  );
  const count = await sequelize.query(
    `SELECT COUNT(*) AS total FROM applications WHERE student_id = $1`,
    { bind: [studentId], type: QueryTypes.SELECT },
  );
  return { rows, total: Number(count[0].total) };
}

module.exports = { create, listByStudent };
