const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    meals: [{type: mongoose.Schema.ObjectId, ref: "Meal"}]
})

const ClientModel = mongoose.model("Client", ClientSchema);
module.exports = ClientModel;