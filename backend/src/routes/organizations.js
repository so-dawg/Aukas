const { Router } = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const organizationController = require("../controllers/organizationController");

const router = Router();

router.patch(
   "/organizations/me",
   authenticate,
   requireRole("organization"),
   organizationController.updateProfile,
);

router.get(
   "/organizations/me/opportunities",
   authenticate,
   requireRole("organization"),
   organizationController.listMyOpportunities,
);

module.exports = router;
