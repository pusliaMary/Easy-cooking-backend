import mongoose from "mongoose";

const PROTEINS = ["meat", "poultry", "seafood", "vegan"];
const CATEGORIES = [
  "salad",
  "soup",
  "garnish",
  "main Course",
  "dessert",
  "drink",
];

const ingredientItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const recipeSchema = new mongoose.Schema(
  {
    imgSource: { type: String, required: true, trim: true },

    title: { type: String, required: true, trim: true, index: true },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: CATEGORIES,
        message:
          'Category "{VALUE}" is not on the allowed list: ' +
          CATEGORIES.join(", "),
      },
    },

    containsProtein: { type: Boolean, required: true },

    whatProtein: {
      type: [String],
      enum: {
        values: PROTEINS,
        message:
          'Protein type "{VALUE}" is not on the allowed list: ' +
          PROTEINS.join(", "),
      },
      validate: {
        validator: function (value) {
          // Корректно вытаскивает обновляемые поля как для создания, так и для PUT/PATCH обновлений
          const currentDoc =
            this.op === "update" || this.constructor.name === "Query"
              ? this.getUpdate()
              : this;

          const containsProtein =
            currentDoc.containsProtein ??
            (currentDoc.$set && currentDoc.$set.containsProtein);

          if (containsProtein === true) {
            return Array.isArray(value) && value.length > 0;
          }
          return true;
        },
        message:
          "If containsProtein is true, the whatProtein field is required and cannot be empty",
      },
    },

    containsFiber: { type: Boolean, required: true },

    ingredients: {
      type: [ingredientItemSchema],
      required: [true, "Ingredients list is required"],
      validate: [
        (v) => Array.isArray(v) && v.length >= 3,
        "Ingredients list must contain at least 3 items",
      ],
    },

    steps: {
      type: [String],
      required: [true, "Cooking steps list is required"],
      validate: [
        (v) => Array.isArray(v) && v.length >= 2,
        "Steps list must contain at least 2 steps",
      ],
    },

    keyWords: {
      type: [String],
      required: [true, "KeyWords list is required"],
      validate: [
        (v) => Array.isArray(v) && v.length >= 2,
        "KeyWords list must contain at least 2 keywords",
      ],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Recipe", recipeSchema);
