const { Router } = require("express");
const opportunityController = require("../controllers/opportunityController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = Router();

router.get("/opportunities", opportunityController.list);
router.get("/opportunities/:id", opportunityController.getById);

router.post(
  "/opportunities",
  authenticate,
  requireRole("organization"),
  opportunityController.create,
);
router.patch(
  "/opportunities/:id",
  authenticate,
  requireRole("organization"),
  opportunityController.update,
);
router.patch(
  "/opportunities/:id/status",
  authenticate,
  opportunityController.updateStatus,
);
router.delete(
  "/opportunities/:id",
  authenticate,
  requireRole("organization", "admin"),
  opportunityController.remove,
);

module.exports = router;
