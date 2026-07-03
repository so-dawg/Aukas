// Admin-only routes — manage opportunities, users, and org verification.
const { Router } = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/opportunities", adminController.listOpportunities);
router.get("/users", adminController.listUsers);
router.patch(
  "/organizations/:user_id/verify",
  adminController.verifyOrganization,
);

module.exports = router;
