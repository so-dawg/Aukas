// Organization model — lookup and update profile/verification status.
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Organization = sequelize.define(
  "Organization",
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    org_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING(255),
    },
    description: {
      type: DataTypes.TEXT,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "organizations",
    timestamps: false,
  },
);

module.exports = Organization;
