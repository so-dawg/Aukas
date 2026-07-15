"use strict";

module.exports = {
  up: async (qi) => {
    await qi.sequelize.query(`
      ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS cv_url varchar(500);
    `);
  },

  down: async (qi) => {
    await qi.sequelize.query(`
      ALTER TABLE applications
      DROP COLUMN IF EXISTS cv_url;
    `);
  },
};
