const mongoose = require("mongoose");

const PROTEINS = ["meat", "poultry", "seafood", "vegan"];
const CATEGORIES = ["salad", "soup", "garnish", "mainCourse", "dessert", "drink"];


const ingredientItemSchema = new mongoose.Schema({ //  могут появиться новые поля (количество, единицы измерения)
  name: { type: String, required: true, trim: true } 
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  imgSource: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true, index: true },
  
  category: { 
    type: String,
    required: [true, "Category is required"],
    enum: {
      values: CATEGORIES,
      message: 'Category "{VALUE}" is not on the allowed list: ' + CATEGORIES.join(", ")
    }
  }, 

  containsProtein: { type: Boolean, required: true },
  
  whatProtein: { 
    type: [String],
    enum: {
      values: PROTEINS,
      message: 'Protein type "{VALUE}" is not on the allowed list: ' + PROTEINS.join(", ")
    },
    validate: {
      validator: function(value) {
        const doc = this.getUpdate ? this.getUpdate().$set : this;
        if (doc && doc.containsProtein === true) {
          return Array.isArray(value) && value.length > 0;
        }
        return true;
      },
      message: "If containsProtein is true, the whatProtein field is required and cannot be empty"
    }
  },
  
  containsFiber: { type: Boolean, required: true },
  
  ingredients: { 
    type: [ingredientItemSchema], 
    required: [true, "Ingredients list is required"],
    validate: [v => Array.isArray(v) && v.length > 0, "Ingredients list cannot be empty"]
  },
  
  steps: { 
    type: [String], 
    required: [true, "Cooking steps list is required"],
    validate: [v => Array.isArray(v) && v.length > 0, "Steps list cannot be empty"]
  },
  
  keyWords: { 
    type: [String], 
    required: [true, "KeyWords list is required"] 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Recipe", recipeSchema);
