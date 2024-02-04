const Client = require("../models/Clients");
const Meal = require("../models/Meals");
const User = require("../models/Users");
const bcrypt = require("bcrypt");
const ObjectId = require("mongoose").Types.ObjectId;

const getClientByEmail = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({
      message: "Client email must be provided.",
    });
  }

  const client = await Client.findOne({ email: email })
    .select("-password")
    .lean();
  if (!client) {
    return res
      .status(400)
      .json({ message: `No client with email ${email} was found.` });
  }

  const clientUser =
    client.user && ObjectId.isValid(client.user)
      ? await User.findById(client.user).lean()
      : null;

  if (
    req.user === client.email ||
    (clientUser && req.user === clientUser.email)
  ) {
    return res.json({
      ...client,
    });
  }

  return res.status(401).json({
    message: "Unauthorized",
  });
};

const getClientMeals = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({
      message: "Client email must be provided.",
    });
  }

  const client = await Client.findOne({ email: email }).lean();
  const clientUser =
    client && client.user && ObjectId.isValid(client.user)
      ? await User.findById(client.user).lean()
      : null;
  if (
    !(
      req.user === client.email ||
      (clientUser && req.user === clientUser.email)
    )
  ) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (!client) {
    return res
      .status(400)
      .json({ message: `No client with email ${email} was found.` });
  }

  const clientMeals = await Meal.find({ client: client._id }).lean();
  if (!clientMeals || clientMeals.length === 0) {
    return res.status(400).json({
      message: "This client has no meals.",
    });
  }

  return res.status(200).json(clientMeals);
};

const updateClient = async (req, res) => {
  const { email } = req.params;
  const { password, name, surname, photo } = req.body;

  if (!email && !password && !name && !surname && !photo) {
    return res.status(400).json({
      message:
        "The new password, surname, name, or photo must be provided alongside client email.",
    });
  }

  const client = await Client.findOne({ email: email }).exec();
  if (req.user !== email) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  if (!client) {
    res
      .status(400)
      .json({ message: `Client withe email ${email} was not found.` });
  }

  if (password) {
    client.password = await bcrypt.hash(password, 10);
  }
  if (name) {
    client.name = name;
  }
  if (surname) {
    client.surname = surname;
  }
  if (photo) {
    client.photo = photo;
  }

  const updatedUser = await client.save();
  return res.json({
    message: `Client ${updatedUser.email} has been updated.`,
  });
};

const deleteClient = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Client email required." });
  }

  const client = await Client.findOne({ email: email }).exec();
  if (req.user !== email) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  if (!client) {
    return res.status(400).json({ message: "Client not found." });
  }

  await Meal.deleteMany({ client: client._id });
  const result = await client.deleteOne();

  return res.json({
    message: `Client ${result.email} has been deleted.`,
  });
};

const unassignClient = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Client email required." });
  }

  const client = await Client.findOne({ email: email }).exec();
  if (req.user !== email) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  if (!client) {
    return res.status(400).json({ message: "Client not found." });
  }

  client.user = undefined;
  const unassignedClient = await client.save();

  return res.json({
    message: `Client ${unassignedClient.email} has been unassigned and can now be assigned to a different user.`,
  });
};

module.exports = {
  getClientByEmail,
  getClientMeals,
  updateClient,
  deleteClient,
  unassignClient,
};
