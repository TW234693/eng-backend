
const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    instructions: {
        type: String,
        required: true,
    },
    ingredients: {
        type: [{
            name: {
                type: String,
                required: true,
            },
            quantityGrams: {
                type: Number,
                required: true,
            },
            fatGrams: {
                type: Number
            },
            carbohydrateGrams: {
                type: Number
            },
            proteinGrams: {
                type: Number
            }
        }],
        validate: [(val) => val.length > 0, "A meal must contain at least 1 ingredient"]
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
        required: true
    }
}, {
    collection: "Meal"
})

const MealModel = mongoose.model("Meal", MealSchema);
module.exports = MealModel;