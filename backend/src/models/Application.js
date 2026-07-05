// Applications model — student applies to an opportunity, lists their submitted applications.
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    opportunity_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("clicked", "in_review", "accepted", "rejected"),
      allowNull: false,
      defaultValue: "clicked",
    },
    applied_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "applications",
    timestamps: false,
  },
);

module.exports = Application;
