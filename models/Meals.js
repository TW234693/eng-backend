
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
    ingredients: [{
        name: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
    }],
    minutesCookingTime: {
        type: String,
        required: true,
    },
    mealDate: {
        type: Date,
        required: true,
    },
    client: {
        type: mongoose.Schema.ObjectId,
        ref: "Client"
    }
}, {
    collection: "Meal"
})

const MealModel = mongoose.model("Meal", MealSchema);
module.exports = MealModel;