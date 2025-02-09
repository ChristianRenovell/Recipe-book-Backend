const Recipe = require("./Recipe");
const Ingredient = require("./Ingredient");

Recipe.hasMany(Ingredient, {
  foreignKey: "recipe_id",
  as: "ingredients",
});

Ingredient.belongsTo(Recipe, {
  foreignKey: "recipe_id",
  as: "recipe",
});

module.exports = { Recipe, Ingredient };
