const db = require("../db");

async function listByStudent(userId, { limit, offset }) {
   const { rows } = await db.query(
      `SELECT b.saved_at, ...opp columns...
       FROM bookmarks b
       JOIN opportunities o ON o.id = b.opportunity_id
      WHERE b.student_id = $1
      ORDER BY b.saved_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
   );
   return { rows };
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
