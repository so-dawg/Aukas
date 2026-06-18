const db = require("../db");

async function findByUserId(userId) {
   const { rows } = await db.query(
      `SELECT user_id, org_name, website, description, verified FROM organizations WHERE user_id= $1`,
      [userId],
   );
   return rows[0] || null;
}

module.exports = { findByUserId };
