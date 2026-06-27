const { Router } = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/admin/opportunities", adminController.listOpportunities);
router.get("/admin/users", adminController.listUsers);
router.patch(
  "/admin/organizations/:user_id/verify",
  adminController.verifyOrganization,
);

module.exports = router;
