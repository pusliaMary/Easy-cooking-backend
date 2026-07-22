const mongoose = require("mongoose");

const ingredientItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  imgSource: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true, index: true },
  category: { type: String, required: true, trim: true },
  
  ingredients: { 
    type: [ingredientItemSchema], 
    required: [true, "Список ингредиентов обязателен"] 
  },
  
  steps: { 
    type: [String], 
    required: [true, "Шаги приготовления обязательны"] 
  },
  keyWords: { 
    type: [String], 
    required: [true, "Шаги приготовления обязательны"] 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Recipe", recipeSchema);
