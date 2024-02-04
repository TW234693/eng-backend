const mongoose = require("mongoose");

const MealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    instructions: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    ingredients: {
      type: [
        {
          quantityGrams: {
            type: Number,
            required: true,
          },
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
        },
      ],
      validate: [
        (val) => val.length > 0,
        "A meal must contain at least 1 ingredient",
      ],
    },
    minutesCookingTime: {
      type: Number,
      required: true,
    },
    mealDate: {
      type: Date,
      required: true,
    },
    client: {
      type: mongoose.Schema.ObjectId,
      ref: "Client",
      required: true,
    },
  },
  {
    collection: "Meal",
  }
);

const MealModel = mongoose.model("Meal", MealSchema);
module.exports = MealModel;
