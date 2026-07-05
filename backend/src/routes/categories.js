// Public endpoint listing all opportunity categories (e.g. Tech, Health, Education).
const { Router } = require("express");
const { Category } = require("../models");

const router = Router();

router.get("/categories", async (_req, res) => {
  const rows = await Category.findAll({ order: [["name"]] });
  res.json({ data: rows });
});

module.exports = router;
