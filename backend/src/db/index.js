const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// TLS is configurable to support both local Postgres (no SSL) and managed DBs
// (SSL required). Enable with DB_SSL=true or in production by default.
const databaseUrl = new URL(process.env.DATABASE_URL);
databaseUrl.searchParams.delete("sslmode");

const useSsl =
  process.env.DB_SSL === "true" || process.env.NODE_ENV === "production";

let dialectOptions;
if (useSsl) {
  const ssl = {
    require: true,
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
  };

  const defaultCaPath = path.join(__dirname, "../../certs/ca.pem");
  const configuredCaPath = process.env.DB_SSL_CA_PATH;
  const caPath = configuredCaPath
    ? path.isAbsolute(configuredCaPath)
      ? configuredCaPath
      : path.join(__dirname, "../../", configuredCaPath)
    : defaultCaPath;

  if (fs.existsSync(caPath)) {
    ssl.ca = fs.readFileSync(caPath, "utf8");
  }

  dialectOptions = { ssl };
}

const sequelize = new Sequelize(databaseUrl.toString(), {
  dialect: "postgres",
  ...(dialectOptions ? { dialectOptions } : {}),
});

module.exports = sequelize;
