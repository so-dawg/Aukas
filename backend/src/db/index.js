const { Sequelize } = require("sequelize");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "Missing DATABASE_URL environment variable. Copy .env.example to .env and set DATABASE_URL in the project root.",
  );
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: "postgres",
});
module.exports = sequelize;
