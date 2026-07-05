const User = require("./User");
const Student = require("./Student");
const Organization = require("./Organization");
const Category = require("./Category");
const Opportunity = require("./Opportunity");
const Application = require("./Application");
const Bookmark = require("./Bookmark");

// Users → Students / Organizations (1-to-1)
User.hasOne(Student, { foreignKey: "user_id" });
User.hasOne(Organization, { foreignKey: "user_id" });
Student.belongsTo(User, { foreignKey: "user_id" });
Organization.belongsTo(User, { foreignKey: "user_id" });

// Categories → Opportunities
Category.hasMany(Opportunity, { foreignKey: "category_id" });
Opportunity.belongsTo(Category, { foreignKey: "category_id" });

// Organizations → Opportunities
Organization.hasMany(Opportunity, { foreignKey: "organization_id" });
Opportunity.belongsTo(Organization, { foreignKey: "organization_id" });

// Admin approver (users who approved an opportunity)
Opportunity.belongsTo(User, { as: "approver", foreignKey: "approved_by" });

// Students → Applications / Bookmarks
Student.hasMany(Application, { foreignKey: "student_id" });
Student.hasMany(Bookmark, { foreignKey: "student_id" });
Application.belongsTo(Student, { foreignKey: "student_id" });
Bookmark.belongsTo(Student, { foreignKey: "student_id" });

// Opportunities → Applications / Bookmarks
Opportunity.hasMany(Application, { foreignKey: "opportunity_id" });
Opportunity.hasMany(Bookmark, { foreignKey: "opportunity_id" });
Application.belongsTo(Opportunity, { foreignKey: "opportunity_id" });
Bookmark.belongsTo(Opportunity, { foreignKey: "opportunity_id" });

module.exports = {
  User,
  Student,
  Organization,
  Category,
  Opportunity,
  Application,
  Bookmark,
};
