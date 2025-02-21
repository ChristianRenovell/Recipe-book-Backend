const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/", verifyToken, recipeController.createRecipe);
router.put("/", verifyToken, recipeController.updateRecipe);
router.delete("/:recipe_id", verifyToken, recipeController.deleteRecipe);
router.get("/get-all", recipeController.getAllRecipes);
router.get("/get-by-user-id/:user_id", recipeController.getAllRecipesByUserId);
router.get(
  "/get-by-recipe-id/:recipe_id",
  recipeController.getAllRecipesByRecipeId
);
router.post("/filter", recipeController.filterRecipes);

module.exports = router;
