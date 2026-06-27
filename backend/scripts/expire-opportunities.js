require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env"),
});
const { query } = require("../src/db");

async function run() {
  const { rowCount } = await query(
    `UPDATE opportunities
        SET status = 'expired'
      WHERE status = 'approved'
        AND deadline < CURRENT_DATE
        AND deleted_at IS NULL`,
  );
  console.log(`Expired ${rowCount} opportunities.`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
