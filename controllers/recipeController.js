const Recipe = require("../models/Recipe");
const Ingredient = require("../models/Ingredient");

exports.createRecipe = async (req, res) => {
  try {
    const {
      user_id,
      username,
      title,
      description,
      preparation,
      image_url,
      ingredients,
    } = req.body;

    const newRecipe = await Recipe.create({
      user_id,
      username,
      title,
      description,
      preparation,
      image_url,
    });

    if (ingredients && ingredients.length > 0) {
      const ingredientsData = ingredients.map((ing) => ({
        recipe_id: newRecipe.recipe_id,
        ingredient: ing.ingredient,
        quantity: ing.quantity,
        observations: ing.observations,
      }));
      await Ingredient.bulkCreate(ingredientsData);
    }

    res
      .status(201)
      .json({ message: "Receta creada con éxito", recipe: newRecipe });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
