const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, recipeController.createRecipe);

module.exports = router;
