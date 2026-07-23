const mongoose = require("mongoose");

const ingredientItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true } 
}, { _id: false });

const proteins = ["meat", "poultry", "seafood", "vegan"];

const proteinSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true, 
    trim: true,
    enum: {
        values: proteins,
        message: 'Ингредиент "{VALUE}" недопустим или отсутствует в закрытом списке.'
      }
  }
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  imgSource: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true, index: true },
  category: { type: String, required: true, trim: true }, 
  containsProtein: { type: Boolean, required: true },
  
  whatProtein: { 
    type: [proteinSchema],
    validate: {
      validator: function(value) {
        if (this.containsProtein === true) {
          return Array.isArray(value) && value.length > 0;
        }
        return true;
      },
      message: "Если containsProtein истинно, поле whatProtein обязательно к заполнению и не может быть пустым."
    }
  },
  
  containsFiber: { type: Boolean, required: true },
  
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
    required: [true, "Ключевые слова обязательны"] 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("recipe", recipeSchema);
