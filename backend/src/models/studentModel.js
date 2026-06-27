const db = require("../db");

const UPDATABLE = ["university", "major", "year_of_study", "resume_url"];

async function findByUserId(userId) {
  const { rows } = await db.query(
    `SELECT user_id, university, major, year_of_study, resume_url FROM students WHERE user_id = $1`,
    [userId],
  );
  return rows[0] || null;
}

async function update(userId, fields) {
  const cols = Object.keys(fields).filter((c) => UPDATABLE.includes(c));
  if (cols.length === 0) return findByUserId(userId);

  const set = cols.map((c, i) => `${c} = $${i + 1}`);
  const params = cols.map((c) => fields[c]);
  params.push(userId);

  await db.query(
    `UPDATE students SET ${set.join(", ")} WHERE user_id = $${params.length}`,
    params,
  );
  return findByUserId(userId);
}

module.exports = { findByUserId, update };
