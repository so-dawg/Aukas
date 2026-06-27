const db = require("../db");

const UPDATABLE = ["org_name", "website", "description"];

async function findByUserId(userId) {
   const { rows } = await db.query(
      `SELECT user_id, org_name, website, description, verified FROM organizations WHERE user_id= $1`,
      [userId],
   );
   return rows[0] || null;
}

async function update(userId, fields) {
   const cols = Object.keys(fields).filter((col) => UPDATABLE.includes(col));
   if (cols.length === 0) return findByUserId(userId);
   const set = cols.map((c, i) => `${c} = $${i + 1}`);
   const params = cols.map((c) => fields[c]);
   params.push(userId);
   await db.query(
      `UPDATE organizations SET ${set.join(", ")} WHERE user_id = $${params.length}`,
      params,
   );
   return findByUserId(userId);
}

module.exports = { findByUserId, update };
