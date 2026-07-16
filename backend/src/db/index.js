const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Aiven supplies its own CA. `sslmode=require` inside a connection URL causes
// pg to replace this SSL configuration, which loses that CA and rejects the
// certificate as self-signed. TLS is configured explicitly below instead.
const databaseUrl = new URL(process.env.DATABASE_URL);
databaseUrl.searchParams.delete("sslmode");

const sequelize = new Sequelize(databaseUrl.toString(), {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
      ca: fs.readFileSync(
        path.join(__dirname, "../../certs/ca.pem"),
        "utf8"
      ),
    },
  },
});

module.exports = sequelize;
