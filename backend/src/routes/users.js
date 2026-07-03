// User routes — self-service (update/delete own profile) and admin user lookup.
const { Router } = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const userController = require("../controllers/userController");

const router = Router();

router.patch("/users/me", authenticate, userController.updateMe);
router.delete("/users/me", authenticate, userController.deleteMe);
router.get(
  "/users/:id",
  authenticate,
  requireRole("admin"),
  userController.getUser,
);
router.patch(
  "/students/me",
  authenticate,
  requireRole("student"),
  userController.updateStudentProfile,
);

module.exports = router;
