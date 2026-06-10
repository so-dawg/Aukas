const { Router } = require("express");
const db = require("../db");

const router = Router();

router.get("/health", async (_req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", db: err.message });
  }
});

router.get;

module.exports = router;
