const User = require("../models/Users");
const Client = require("../models/Clients");
const Ingredient = require("../models/Ingredients");
const bcrypt = require("bcrypt");

const getUserClients = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({
      message: "User email must be provided.",
    });
  }

  if (req.user !== email) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const user = await User.findOne({ email: email }).select("-password").lean();
  if (!user) {
    return res
      .status(400)
      .json({ message: `No user with email ${email} was found.` });
  }

  const clients = await Client.find({ user: user._id })
    .select("-password")
    .lean();
  if (!clients || clients.length === 0) {
    return res.status(400).json({ message: "This user has no clients" });
  }

  return res.status(200).json({ clients });
};

const getUserIngredients = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({
      message: "User email must be provided.",
    });
  }

  if (req.user !== email) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const user = await User.findOne({ email: email }).select("-password").lean();
  if (!user) {
    return res
      .status(400)
      .json({ message: `No user with email ${email} was found.` });
  }

  const ingredients = await Ingredient.find({ user: user._id }).lean();
  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ message: "This user has no ingredients" });
  }

  return res.status(200).json({ ingredients: ingredients });
};

const assignClient = async (req, res) => {
  const { userEmail, clientEmail } = req.body;
  if (!userEmail) {
    return res.status(400).json({
      message: "User email must be provided.",
    });
  }

  if (req.user !== userEmail) {
    return res.status(401).json({
      message: "Unauthorized, cannot assign client",
    });
  }

  const user = await User.findOne({ email: userEmail })
    .select("-password")
    .lean()
    .exec();
  if (!user) {
    return res
      .status(400)
      .json({ message: `No user with email ${userEmail} was found.` });
  }

  const client = await Client.findOne({ email: clientEmail })
    .select("-password")
    .exec();
  if (!client) {
    return res
      .status(400)
      .json({ message: `No client with email ${clientEmail} was found.` });
  }

  if (client.user && user._id.equals(client.user._id)) {
    return res.status(400).json({
      message: `User ${userEmail} is already assigned to client ${clientEmail}.`,
    });
  }
  if (client.user) {
    return res.status(400).json({
      message: `Client ${clientEmail} is already assigned to a different user and must unassign themself first before being assigned elsewhere.`,
    });
  }

  client.user = user._id;
  const updatedClient = await client.save();
  return res.status(201).json({
    message: `Client ${updatedClient.email} has been assigned.`,
  });
};

const updateUser = async (req, res) => {
  const { email } = req.params;
  const { currentPassword, newPassword, name, surname, description, photo } =
    req.body;

  if (!email && !newPassword && !name && !surname && !photo) {
    return res.status(400).json({
      message:
        "The new password, surname, name, or photo must be provided alongside user email.",
    });
  }

  if (req.user !== email) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const user = await User.findOne({ email: email }).exec();
  if (!user) {
    res.status(400).json({ message: "User not found." });
  }

  if (newPassword && currentPassword) {
    if (bcrypt.compareSync(currentPassword, user.password)) {
      user.password = await bcrypt.hash(newPassword, 10);
    } else {
      return res.status(400).json({
        message:
          "The provided current password is incorrect. Profile failed to update.",
      });
    }
  }
  if (name) {
    user.name = name;
  }
  if (surname) {
    user.surname = surname;
  }
  if (description) {
    user.description = description;
  }
  if (photo) {
    user.photo = photo;
  }

  const updatedUser = await user.save();
  return res.json({
    message: `User ${updatedUser.email} has been updated.`,
    user,
  });
};

const updateClientNotes = async (req, res) => {
  const { userEmail, clientEmail } = req.params;
  const { notes } = req.body;

  if (!userEmail || !clientEmail) {
    return res.status(400).json({
      message: "User email and client emails must be provided",
    });
  }

  if (req.user !== userEmail) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const user = await User.findOne({ email: userEmail }).exec();
  if (!user) {
    res.status(400).json({ message: "User not found." });
  }

  const client = await Client.findOne({ email: clientEmail }).exec();
  if (!client) {
    res.status(400).json({ message: "User not found." });
  }

  if (!client.user._id.equals(user._id)) {
    return res.status(400).json({
      message: `Client ${clientEmail} is not assigned to user ${userEmail}`,
    });
  }

  client.notes = notes;
  const updatedClient = await client.save();
  return res.json({
    message: `Client ${updatedClient.email}'s notes have been updated.`,
  });
};

const deleteUser = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "User email required." });
  }

  if (req.user !== email) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const user = await User.findOne({ email: email }).exec();
  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  await Client.updateMany({ user: user._id }, { $unset: { user: undefined } });
  const result = await user.deleteOne();

  const reply = `User with email ${result.email} has been deleted.`;

  return res.json({ message: reply });
};

module.exports = {
  getUserClients,
  assignClient,
  deleteUser,
  updateUser,
  updateClientNotes,
  getUserIngredients,
};
