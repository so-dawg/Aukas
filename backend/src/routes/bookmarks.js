// Bookmark routes — students can save/favourite opportunities for later.
const { Router } = require("express");
const { authenticate, requireRole } = require("../middleware/auth");
const bookmarksController = require("../controllers/bookmarksController");

const router = Router();

router.get(
   "/bookmarks",
   authenticate,
   requireRole("student"),
   bookmarksController.list,
);
router.post(
   "/bookmarks",
   authenticate,
   requireRole("student"),
   bookmarksController.create,
);
router.delete(
   "/bookmarks/:opportunity_id",
   authenticate,
   requireRole("student"),
   bookmarksController.remove,
);

module.exports = router;
