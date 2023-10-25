const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
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
    notes: {
        type: String
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    }
}, {
    collection: "Client"
})

const ClientModel = mongoose.model("Client", ClientSchema);
module.exports = ClientModel;