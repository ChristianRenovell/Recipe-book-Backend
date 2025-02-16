const { DataTypes } = require("sequelize");
const sequelize = require("../db/connection");

const Recipe = sequelize.define(
  "Recipe",
  {
    recipe_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    preparation: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_url: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "recipes",
    timestamps: false,
  }
);

module.exports = Recipe;
