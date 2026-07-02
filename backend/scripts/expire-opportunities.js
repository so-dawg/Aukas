require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const sequelize = require("../src/db");

async function run() {
  const [_, metadata] = await sequelize.query(
    `UPDATE opportunities
        SET status = 'expired'
      WHERE status = 'approved'
        AND deadline < CURRENT_DATE
        AND deleted_at IS NULL`,
  );
  console.log(`Expired ${metadata.rowCount} opportunities.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
