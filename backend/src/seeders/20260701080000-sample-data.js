"use strict";
const fs = require("fs");
const path = require("path");

module.exports = {
  up: async (qi) => {
    const sql = fs.readFileSync(
      path.resolve(__dirname, "..", "seed.sql"),
      "utf8",
    );
    await qi.sequelize.query(sql);
  },
  down: async (qi) => {
    await qi.sequelize.query(
      "TRUNCATE applications, bookmarks, opportunities, students, organizations, users CASCADE",
    );
  },
};
