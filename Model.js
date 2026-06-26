const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  src: { type: String, required: true },
  });

const descriptionSchema = new mongoose.Schema({
  ingredients: { type: String, required: true },
  process: { type: String, required: true },
});

const keywordsSchema = new mongoose.Schema({
  word: { type: String, required: true }
  });

const recipeSchema = new mongoose.Schema(
  {

    category: { type: String, required: true },
    title: { type: String, required: true },
    image: {type: imageSchema, required: true},
    description: { type: descriptionSchema, required: true },
    keywords: { type: [keywordsSchema], required: true },

  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Recipe', recipeSchema)