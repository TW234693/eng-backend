const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    nutrients: {
      type: [
        {
          code: {
            type: String,
            required: true,
          },
          label: {
            type: String,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          unit: {
            type: String,
            required: true,
          },
        },
      ],
      required: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    collection: "Ingredient",
  }
);

const IngredientModel = mongoose.model("Ingredient", IngredientSchema);
module.exports = IngredientModel;
