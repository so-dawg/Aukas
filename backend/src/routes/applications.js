// Application routes — students apply to opportunities and view their applications.
const { Router } = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const applicationController = require("../controllers/applicationController");
const upload = require("../config/multer");

const router = Router();

router.post(
  "/applications",
  authenticate,
  requireRole("student"),
  upload.single("cv"),
  applicationController.create,
);
router.get(
  "/applications/me",
  authenticate,
  requireRole("student"),
  applicationController.listMy,
);
router.get(
  "/applications/received",
  authenticate,
  requireRole("organization"),
  applicationController.listReceived,
);

module.exports = router;
