"use strict";
const fs = require("fs");
const path = require("path");

module.exports = {
  up: async (qi) => {
    const sql = fs.readFileSync(
      path.resolve(__dirname, "..", "schema.sql"),
      "utf8",
    );
    await qi.sequelize.query(sql);
  },
  down: async (qi) => {
    await qi.sequelize.query(`
      DROP TABLE IF EXISTS applications, bookmarks, opportunities,
        categories, organizations, students, users CASCADE;
      DROP TYPE IF EXISTS user_role, opportunity_type,
        opportunity_status, application_status;
    `);
  },
};
