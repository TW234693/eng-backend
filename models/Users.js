const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
    clients: [{type: mongoose.Schema.ObjectId, ref: "Client"}]
})

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;