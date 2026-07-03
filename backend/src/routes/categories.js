// Public endpoint listing all opportunity categories (e.g. Tech, Health, Education).
const { Router } = require("express");
const sequelize = require("../db");

const router = Router();

router.get("/categories", async (_req, res) => {
  const [rows] = await sequelize.query(
    "SELECT id, name, slug FROM categories ORDER BY name",
  );
  res.json({ data: rows });
});

module.exports = router;
