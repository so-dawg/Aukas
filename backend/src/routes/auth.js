const { Router } = require("express");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

const router = Router();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", authenticate, authController.me); // only this one needs a token

module.exports = router;
