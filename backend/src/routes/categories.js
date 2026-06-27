const { Router } = require("express");
const db = require("../db");

const router = Router();

router.get("/categories", async (_req, res) => {
  const { rows } = await db.query(
    "SELECT id, name, slug FROM categories ORDER BY name",
  );
  res.json({ data: rows });
});

module.exports = router;
