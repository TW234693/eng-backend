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
    rating: {
      default: [],
      required: true,
      type: [
        {
          client: {
            type: mongoose.Schema.ObjectId,
            ref: "Client",
            required: true,
          },
          value: {
            type: Number,
            required: true,
          },
        },
      ],
    },
  },
  {
    collection: "User",
  }
);

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
