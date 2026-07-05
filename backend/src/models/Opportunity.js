const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Opportunity = sequelize.define(
  "Opportunity",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    organization_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    approved_by: {
      type: DataTypes.UUID,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "internship",
        "job",
        "scholarship",
        "volunteer",
        "competition",
      ),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(150),
    },
    deadline: {
      type: DataTypes.DATEONLY,
    },
    status: {
      type: DataTypes.ENUM(
        "draft",
        "pending",
        "approved",
        "rejected",
        "expired",
      ),
      allowNull: false,
      defaultValue: "pending",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "opportunities",
    timestamps: false,
  },
);

module.exports = Opportunity;
