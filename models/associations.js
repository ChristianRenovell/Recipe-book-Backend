const Recipe = require("./Recipe");
const Ingredient = require("./Ingredient");
const Step = require("./steps");

Recipe.hasMany(Ingredient, {
  foreignKey: "recipe_id",
  as: "ingredients",
});

Ingredient.belongsTo(Recipe, {
  foreignKey: "recipe_id",
  as: "recipe",
});

Step.belongsTo(Recipe, {
  foreignKey: "recipe_id",
  onDelete: "CASCADE",
});

Recipe.hasMany(Step, {
  foreignKey: "recipe_id",
  as: "steps",
});

module.exports = { Recipe, Ingredient, Step };
