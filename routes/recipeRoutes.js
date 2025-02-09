const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, recipeController.createRecipe);
router.get("/get-all", verifyToken, recipeController.getAllRecipes);
router.get(
  "/get-by-user-id/:user_id",
  verifyToken,
  recipeController.getAllRecipesByUserId
);
router.get(
  "/get-by-recipe-id/:recipe_id",
  verifyToken,
  recipeController.getAllRecipesByRecipeId
);
router.post("/filter", verifyToken, recipeController.filterRecipes);

module.exports = router;
