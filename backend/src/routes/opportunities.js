const { Router } = require("express");
const opportunityController = require("../controllers/opportunityController");

const router = Router();

router.get("/opportunities", opportunityController.list);

module.exports = router;