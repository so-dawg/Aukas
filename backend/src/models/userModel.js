// User model — lookup, create (with student/org profile), update, soft-delete, admin list.
const { QueryTypes } = require("sequelize");
const sequelize = require("../db");

async function findActiveByEmail(email) {
  const rows = await sequelize.query(
    `SELECT id, email, password_hash, full_name, role, created_at
       FROM users
      WHERE email = $1 AND deleted_at IS NULL`,
    { bind: [email], type: QueryTypes.SELECT },
  );
  return rows[0] || null;
}

async function findActiveById(id) {
  const rows = await sequelize.query(
    `SELECT id, email, full_name, role, created_at
       FROM users
      WHERE id = $1 AND deleted_at IS NULL`,
    { bind: [id], type: QueryTypes.SELECT },
  );
  return rows[0] || null;
}

async function getProfile(userId, role) {
  if (role === "student") {
    const rows = await sequelize.query(
      `SELECT university, major, year_of_study, resume_url
         FROM students WHERE user_id = $1`,
      { bind: [userId], type: QueryTypes.SELECT },
    );
    return rows[0] || null;
  }
  if (role === "organization") {
    const rows = await sequelize.query(
      `SELECT org_name, website, description, verified
         FROM organizations WHERE user_id = $1`,
      { bind: [userId], type: QueryTypes.SELECT },
    );
    return rows[0] || null;
  }
  return null;
}

async function createWithProfile({
  email,
  passwordHash,
  full_name,
  role,
  profile,
}) {
  return sequelize.transaction(async (t) => {
    const rows = await sequelize.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`,
      {
        bind: [email, passwordHash, full_name, role],
        type: QueryTypes.SELECT,
        transaction: t,
      },
    );
    const user = rows[0];

    if (role === "student") {
      await sequelize.query(
        `INSERT INTO students (user_id, university, major, year_of_study, resume_url)
         VALUES ($1, $2, $3, $4, $5)`,
        {
          bind: [
            user.id,
            profile.university ?? null,
            profile.major ?? null,
            profile.year_of_study ?? null,
            profile.resume_url ?? null,
          ],
          transaction: t,
        },
      );
    } else if (role === "organization") {
      await sequelize.query(
        `INSERT INTO organizations (user_id, org_name, website, description)
         VALUES ($1, $2, $3, $4)`,
        {
          bind: [
            user.id,
            profile.org_name,
            profile.website ?? null,
            profile.description ?? null,
          ],
          transaction: t,
        },
      );
    }

    return user;
  });
}

async function listUsers(filters) {
  const where = ["u.deleted_at IS NULL"];
  const params = [];

  if (filters.role) {
    params.push(filters.role);
    where.push(`u.role = $${params.length}`);
  }

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
    sequelize.query(rowsSql, {
      bind: [...params, limit, offset],
      type: QueryTypes.SELECT,
    }),
    sequelize.query(countSql, { bind: params, type: QueryTypes.SELECT }),
  ]);

  return { rows: rowsResult, total: Number(countResult[0].total) };
}

const USER_UPDATABLE = ["full_name", "email", "password_hash"];

async function update(id, fields) {
  const cols = Object.keys(fields).filter((c) => USER_UPDATABLE.includes(c));
  if (cols.length === 0) return findActiveById(id);

  const set = cols.map((c, i) => `${c} = $${i + 1}`);
  const params = cols.map((c) => fields[c]);
  params.push(id);

  const rows = await sequelize.query(
    `UPDATE users SET ${set.join(", ")} WHERE id = $${params.length} AND deleted_at IS NULL
     RETURNING id, email, full_name, role, created_at`,
    { bind: params, type: QueryTypes.SELECT },
  );
  return rows[0] || null;
}

async function remove(id) {
  await sequelize.query(
    `UPDATE users SET deleted_at = now() WHERE id = $1 AND deleted_at IS NULL`,
    { bind: [id] },
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
