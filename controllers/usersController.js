const User = require("../models/Users");

exports.createUser = async (req, res) => {
  try {
    const { user_id, username, image_url } = req.body;
    console.log(user_id);
    const newUser = await User.create({ user_id, username, image_url });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
