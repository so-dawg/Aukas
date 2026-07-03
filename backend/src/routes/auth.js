// Auth routes — register new accounts, log in, and fetch the current user's profile.
const { Router } = require("express");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", authenticate, authController.me);

module.exports = router;
