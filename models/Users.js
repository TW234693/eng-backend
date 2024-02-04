const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
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
    description: {
      type: String,
    },
    photo: {
      type: String,
    },
  },
  {
    collection: "User",
  }
);

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
