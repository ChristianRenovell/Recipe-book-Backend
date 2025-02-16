const { Recipe, Ingredient } = require("../models/associations");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

exports.createRecipe = async (req, res) => {
  let tempFilePath = null;
  let resultUpImage;

  try {
    const authHeader = req.headers.authorization;

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);

    const user_id = decoded.uid;

    const { username, title, category, description, preparation, ingredients } =
      req.body;

    if (req.files?.files?.tempFilePath) {
      tempFilePath = req.files.files.tempFilePath;
      resultUpImage = await cloudinary.uploadImage(tempFilePath);
    }

    const newRecipe = await Recipe.create({
      user_id,
      username,
      title,
      category,
      description,
      preparation,
      image_url: resultUpImage?.url ? resultUpImage.url : "",
    });

    const ingredientsParse = JSON.parse(ingredients);
    if (ingredientsParse?.length > 0) {
      const ingredientsData = ingredientsParse.map((ing) => ({
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
    console.log(error);
    res.status(400).json({ error: error.message });
  } finally {
    if (tempFilePath) {
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error("Error al eliminar el archivo temporal:", err);
        else
          console.log(
            "Archivo temporal eliminado correctamente:",
            tempFilePath
          );
      });
    }
  }
};

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      attributes: ["title", "image_url", "username", "category"],
    });

    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllRecipesByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    const recipes = await Recipe.findAll({
      where: { user_id },
      attributes: ["title", "image_url", "username", "category"],
      include: [
        {
          model: Ingredient,
          as: "ingredients",
        },
      ],
    });

    if (recipes.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron recetas para este usuario" });
    }

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error al obtener recetas:", error);
    res.status(500).json({ error: "Error al obtener recetas" });
  }
};

exports.getAllRecipesByRecipeId = async (req, res) => {
  try {
    const { recipe_id } = req.params;

    const recipes = await Recipe.findAll({
      where: { recipe_id },
      include: [
        {
          model: Ingredient,
          as: "ingredients",
        },
      ],
    });

    if (recipes.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron recetas con este ID" });
    }

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error al obtener recetas:", error);
    res.status(500).json({ error: "Error al obtener recetas" });
  }
};

exports.filterRecipes = async (req, res) => {
  try {
    const { user_id, category } = req.body;
    const filter = {};
    if (user_id) {
      filter.user_id = user_id;
    }
    if (category) {
      filter.category = category;
    }

    const recipes = await Recipe.findAll({
      where: filter,
      attributes: ["title", "image_url", "username", "category"],
    });

    if (recipes.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron recetas con los criterios dados" });
    }

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error al obtener recetas:", error);
    res.status(500).json({ error: "Error al obtener recetas" });
  }
};
