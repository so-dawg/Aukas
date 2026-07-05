// Student model — lookup and update student-specific profile fields.
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Student = sequelize.define(
  "Student",
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    university: {
      type: DataTypes.STRING(200),
    },
    major: {
      type: DataTypes.STRING(150),
    },
    year_of_study: {
      type: DataTypes.SMALLINT,
      validate: { min: 1, max: 6 },
    },
    resume_url: {
      type: DataTypes.STRING(500),
    },
  },
  {
    tableName: "students",
    timestamps: false,
  },
);

module.exports = Student;
