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
  const { currentPassword, newPassword, name, surname, photo } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "updateClient_error_noEmail",
    });
  }

  if (!(newPassword && currentPassword) && !name && !surname && !photo) {
    return res.status(400).json({
      message: "updateClient_error_noValues",
    });
  }

  const client = await Client.findOne({ email: email }).exec();
  if (req.user !== email) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  if (!client) {
    res.status(400).json({ message: `notFound_client` });
  }

  if (newPassword && currentPassword) {
    if (bcrypt.compareSync(currentPassword, client.password)) {
      client.password = await bcrypt.hash(newPassword, 10);
    } else {
      return res.status(400).json({
        message: "updateClient_error_passwordMismatch",
      });
    }
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

  await client.save();
  return res.json({
    message: `updateClient_success`,
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

const rateUser = async (req, res) => {
  const { email } = req.params;
  const { rating: newRating } = req.body;

  if (!email || !newRating) {
    return res
      .status(400)
      .json({ message: "Client email and rating are required." });
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

  const clientUser =
    client.user && ObjectId.isValid(client.user)
      ? await User.findById(client.user).select("-password")
      : null;

  if (!clientUser) {
    return res
      .status(400)
      .json({ message: "You do not have a user assigned to you." });
  }

  const { rating: currentRatings } = clientUser;
  const currentRating = currentRatings.find((rating) =>
    rating.client.equals(client._id)
  );

  if (!currentRating) {
    const ratingToAdd = {
      client: client._id,
      value: newRating,
    };

    clientUser.rating = [...clientUser.rating, ratingToAdd];
    const updatedClientUsed = await clientUser.save();
    return res.json({
      message: `Your new rating for user ${updatedClientUsed.email} is ${ratingToAdd.value}`,
    });
  } else {
    const newRatings = currentRatings.map((cr) => {
      return cr.client.equals(client._id)
        ? { client: client._id, value: newRating }
        : cr;
    });

    clientUser.rating = newRatings;
    const updatedClientUsed = await clientUser.save();
    return res.json({
      message: `Your updated rating for user ${updatedClientUsed.email} is ${newRating}`,
    });
  }
};

const getCurrentUser = async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Client email is required." });
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

  const clientUser =
    client.user && ObjectId.isValid(client.user)
      ? await User.findById(client.user).select("-password")
      : null;

  if (!clientUser) {
    return res
      .status(400)
      .json({ message: "You do not have a user assigned to you." });
  }

  return res.status(200).json(clientUser);
};

module.exports = {
  getClientByEmail,
  getClientMeals,
  updateClient,
  deleteClient,
  unassignClient,
  rateUser,
  getCurrentUser,
};
