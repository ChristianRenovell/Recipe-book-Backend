const { Recipe, Ingredient, Step } = require("../models/associations");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

exports.createRecipe = async (req, res) => {
  let tempFilePath = null;
  let resultUpImage;

  try {
    const authHeader = req.headers.authorization;

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);

    const user_id = decoded.uid;

    const {
      username,
      title,
      category,
      description,
      ingredients,
      author,
    } = req.body;

    if (req.files?.files?.tempFilePath) {
      tempFilePath = req.files.files.tempFilePath;
      console.log(tempFilePath);
      resultUpImage = await cloudinary.uploadImage(tempFilePath);
    }

    const newRecipe = await Recipe.create({
      user_id,
      username,
      title,
      author,
      category,
      description,
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

    const stepsParse = JSON.parse(req.body.steps);
    if (stepsParse?.length > 0) {
      const stepsData = stepsParse.map((step, index) => ({
        recipe_id: newRecipe.recipe_id,
        step_number: index + 1,
        step_description: step.step_description,
      }));

      await Step.bulkCreate(stepsData);
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
      attributes: [
        "recipe_id",
        "title",
        "image_url",
        "username",
        "category",
        "author",
      ],
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
      attributes: ["recipe_id", "title", "image_url", "username", "category"],
      include: [
        {
          model: Ingredient,
          as: "ingredients",
        },
        {
          model: Step,
          as: "steps",
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

    const recipes = await Recipe.findOne({
      where: { recipe_id },
      include: [
        {
          model: Ingredient,
          as: "ingredients",
        },
        {
          model: Step,
          as: "steps",
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
    const { author, category, title } = req.body;
    const filter = {};
    if (author) {
      filter.author = author;
    }
    if (category) {
      filter.category = category;
    }

    let nameCondition = null;
    if (title) {
      nameCondition = {
        title: {
          [Op.iLike]: `%${title}%`,
        },
      };
    }

    const recipes = await Recipe.findAll({
      where: {
        ...filter,
        ...(nameCondition ? nameCondition : {}),
      },
      attributes: [
        "recipe_id",
        "title",
        "author",
        "image_url",
        "author",
        "category",
      ],
    });

    res.status(200).json(recipes || []);
  } catch (error) {
    console.error("Error al obtener recetas:", error);
    res.status(500).json({ error: "Error al obtener recetas" });
  }
};

exports.updateRecipe = async (req, res) => {
  let tempFilePath = null;
  let resultUpImage;

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No autorizado" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_TOKEN);
    const user_id = decoded.uid;

    const {
      recipe_id,
      username,
      title,
      category,
      description,
      ingredients,
      author,
    } = req.body;

    const recipe = await Recipe.findOne({ where: { recipe_id } });

    if (!recipe) {
      return res
        .status(404)
        .json({ error: "Receta no encontrada" });
    }

    if (req.files?.files?.tempFilePath && req.files?.files?.size > 0) {
      tempFilePath = req.files.files.tempFilePath;
      try {
        resultUpImage = await cloudinary.uploadImage(tempFilePath);
        recipe.image_url = resultUpImage?.url || null;
      } catch (err) {
        console.error("Error al subir imagen a Cloudinary:", err);
      }
    }

    recipe.username = username || recipe.username;
    recipe.title = title || recipe.title;
    recipe.author = author || recipe.author;
    recipe.category = category || recipe.category;
    recipe.description = description || recipe.description;

    

    await recipe.save();

    try {
      const ingredientsParse = ingredients ? JSON.parse(ingredients) : [];
      if (Array.isArray(ingredientsParse) && ingredientsParse.length > 0) {
        await Ingredient.destroy({ where: { recipe_id: recipe.recipe_id } });

        const ingredientsData = ingredientsParse.map((ing) => ({
          recipe_id: recipe.recipe_id,
          ingredient: ing.ingredient,
          quantity: ing.quantity,
          observations: ing.observations,
        }));

        await Ingredient.bulkCreate(ingredientsData);
      }

      if (req.body.steps) {
        const stepsParse = JSON.parse(req.body.steps);
        if (Array.isArray(stepsParse) && stepsParse.length > 0) {
          await Step.destroy({ where: { recipe_id: recipe.recipe_id } });
          const stepsData = stepsParse.map((ste) => ({
            recipe_id: recipe.recipe_id,
            step_number: ste.step_number,
            step_description: ste.step_description,
          }));

          await Step.bulkCreate(stepsData);
        }
      }
    } catch (err) {
      console.error("Error al procesar ingredientes:", err);
    }

    res.status(200).json({ message: "Receta actualizada con éxito", recipe });
  } catch (error) {
    console.error("Error en updateRecipe:", error);
    res.status(400).json({ error: error.message });
  } finally {
    if (tempFilePath) {
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error("Error al eliminar el archivo temporal:", err);
        else console.log("Archivo temporal eliminado:", tempFilePath);
      });
    }
  }
};

exports.deleteRecipe = async (req, res) => {
  try {
    console.log("entro");
    const { recipe_id } = req.params;
    console.log(recipe_id);
    const recipe = await Recipe.findOne({ where: { recipe_id } });

    if (!recipe) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }

    const imageUrl = recipe.image_url;
    console.log(imageUrl);
    await Recipe.destroy({ where: { recipe_id } });

    try {
      // if (imageUrl) {
      //   const publicId = imageUrl.split("/").pop().split(".")[0];
      //   console.log(publicId);
      //   await cloudinary.uploadImage.destroy(publicId);
      // }
    } catch (error) {
      console.log(error);
      res.status(200).json({ message: "Imagen no eliminada" });
    }

    res
      .status(200)
      .json({ message: "Receta y su imagen eliminadas con éxito" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};
