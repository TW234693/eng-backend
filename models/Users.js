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
    }
}, {
    collection: "User"
})

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;