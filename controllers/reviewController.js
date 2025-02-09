const Users = require("../models/Users");
const Recipe = require("../models/Recipe");

exports.createReview = async (req, res) => {
  const { recipe_id, user_id, rating, review_text } = req.body;

  if (!recipe_id || !user_id || !rating) {
    return res.status(400).json({ error: "Faltan parámetros requeridos" });
  }

  const recipe = await Recipe.findByPk(recipe_id);
  const user = await Users.findOne({ where: { user_id } });

  if (!recipe || !user) {
    return res.status(404).json({ error: "Receta o usuario no encontrados" });
  }

  try {
    const review = await Review.create({
      recipe_id,
      user_id,
      rating,
      review_text,
    });

    return res.status(201).json({ message: "Reseña creada", review });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear la reseña" });
  }
};
