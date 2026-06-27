const db = require("../db");

// Includes password_hash — for login verification only. Never send to clients.
async function findActiveByEmail(email) {
  const { rows } = await db.query(
    `SELECT id, email, password_hash, full_name, role, created_at
       FROM users
      WHERE email = $1 AND deleted_at IS NULL`,
    [email],
  );
  return rows[0] || null;
}

async function findActiveById(id) {
  const { rows } = await db.query(
    `SELECT id, email, full_name, role, created_at
       FROM users
      WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  return rows[0] || null;
}

async function getProfile(userId, role) {
  if (role === "student") {
    const { rows } = await db.query(
      `SELECT university, major, year_of_study, resume_url
         FROM students WHERE user_id = $1`,
      [userId],
    );
    return rows[0] || null;
  }
  if (role === "organization") {
    const { rows } = await db.query(
      `SELECT org_name, website, description, verified
         FROM organizations WHERE user_id = $1`,
      [userId],
    );
    return rows[0] || null;
  }
  return null; // admin has no profile row
}

// Insert the user + their role profile atomically.
async function createWithProfile({
  email,
  passwordHash,
  full_name,
  role,
  profile,
}) {
  return db.transaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`,
      [email, passwordHash, full_name, role],
    );
    const user = rows[0];

    if (role === "student") {
      await client.query(
        `INSERT INTO students (user_id, university, major, year_of_study, resume_url)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          user.id,
          profile.university ?? null,
          profile.major ?? null,
          profile.year_of_study ?? null,
          profile.resume_url ?? null,
        ],
      );
    } else if (role === "organization") {
      await client.query(
        `INSERT INTO organizations (user_id, org_name, website, description)
         VALUES ($1, $2, $3, $4)`,
        [
          user.id,
          profile.org_name,
          profile.website ?? null,
          profile.description ?? null,
        ],
      );
    }

    return user;
  });
}

async function listUsers(filters) {
  const where = ["u.deleted_at IS NULL"];
  const params = [];

  const add = (value, clause) => {
    params.push(value);
    where.push(clause(params.length));
  };

  if (filters.role) add(filters.role, (n) => `u.role = $${n}`);

  const { limit, offset } = filters;

  const rowsSql = `
    SELECT u.id, u.email, u.full_name, u.role, u.created_at
    FROM users u
    WHERE ${where.join(" AND ")}
    ORDER BY u.created_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  const countSql = `SELECT COUNT(*) AS total FROM users u WHERE ${where.join(" AND ")}`;

  const [rowsResult, countResult] = await Promise.all([
    db.query(rowsSql, [...params, limit, offset]),
    db.query(countSql, params),
  ]);

  return { rows: rowsResult.rows, total: Number(countResult.rows[0].total) };
}

const USER_UPDATABLE = ["full_name", "email", "password_hash"];

async function update(id, fields) {
  const cols = Object.keys(fields).filter((c) => USER_UPDATABLE.includes(c));
  if (cols.length === 0) return findActiveById(id);

  const set = cols.map((c, i) => `${c} = $${i + 1}`);
  const params = cols.map((c) => fields[c]);
  params.push(id);

  const { rows } = await db.query(
    `UPDATE users SET ${set.join(", ")} WHERE id = $${params.length} AND deleted_at IS NULL
     RETURNING id, email, full_name, role, created_at`,
    params,
  );
  return rows[0] || null;
}

async function remove(id) {
  await db.query(
    `UPDATE users SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
}

module.exports = {
  findActiveByEmail,
  findActiveById,
  getProfile,
  createWithProfile,
  listUsers,
  update,
  remove,
};
