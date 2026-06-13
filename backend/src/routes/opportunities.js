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

module.exports = router;