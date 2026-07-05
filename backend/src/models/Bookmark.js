// Bookmark model — save/remove favourite opportunities for a student, list with full opp details.
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Bookmark = sequelize.define(
  "Bookmark",
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
    saved_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "bookmarks",
    timestamps: false,
  },
);

module.exports = Bookmark;
