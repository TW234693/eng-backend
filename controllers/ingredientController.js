const User = require("../models/Users");
const Ingredient = require("../models/Ingredients");
const ObjectId = require("mongoose").Types.ObjectId;

const getIngredientById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      message: "Ingredient ID must be provided",
    });
  }
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: `${id} isn't a valid ID.`,
    });
  }

  const ingredient = await Ingredient.findById(id).lean();
  if (!ingredient) {
    return res
      .status(400)
      .json({ message: `No ingredient with ID ${id} was found.` });
  }
  if (!ingredient.user) {
    return res.status(500).json({
      message: `Ingredient ${ingredient.name} doesn't have a user assigned.`,
    });
  }
  if (!ObjectId.isValid(ingredient.user)) {
    return res.status(500).json({
      message: `${ingredient.user} isn't a valid ingredient user ID.`,
    });
  }

  const ingredientUser = await User.findById(ingredient.user).lean();
  if (!ingredientUser) {
    return res.status(500).json({
      message: `The user who is assigned to the ingredient ${ingredient.name} couldn't be found`,
    });
  }

  if (req.user !== ingredientUser.email) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  return res.status(200).json({
    ...ingredient,
  });
};

const searchIngredients = async (req, res) => {
  const { query } = req.params;
  const regex = new RegExp(query, "i");

  const user = await User.findOne({ email: { $eq: req.user } })
    .select("-password")
    .lean();
  if (!user) {
    return res
      .status(400)
      .json({ message: `No user with email ${req.user} was found.` });
  }
  if (req.user !== user.email || !req.user) {
    return res.status(401).json({
      message: "Unauthorized xd",
    });
  }

  const ingredients = await Ingredient.find({
    name: { $regex: regex },
  }).lean();

  //   console.log(ingredients);

  const filteredIngredients = ingredients.filter((ingredient) => {
    return ingredient.user._id.equals(user._id);
  });

  //   console.log(filteredIngredients);

  if (!filteredIngredients || filteredIngredients.length <= 0) {
    return res.status(400).json({ message: "No ingredients found." });
  }
  return res.json(filteredIngredients);
};

const createIngredient = async (req, res) => {
  const { name, nutrients, photo } = req.body;

  if (!name || !nutrients) {
    return res.status(400).json({
      message: "Ingredient name and its nutrients must be provided.",
    });
  }

  const ingredientUser = await User.findOne({
    email: { $eq: req.user },
  }).lean();
  if (!ingredientUser) {
    return res.status(500).json({
      message: `No user with email ${req.user} was found.`,
    });
  }
  if (req.user !== ingredientUser.email) {
    console.log(req.user, ingredientUser);
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const newIngredient = {
    name,
    nutrients,
    user: ingredientUser._id,
  };

  if (photo) {
    newIngredient.photo = photo;
  }

  await Ingredient.create(newIngredient);
  res.status(201).json({
    message: `Ingredient ${newIngredient.name} was created!`,
  });
};

const updateIngredient = async (req, res) => {
  const { id } = req.params;
  const { name, nutrients, photo } = req.body;

  if (!name && !nutrients) {
    return res.status(400).json({
      message: `Updated ingredient name or nutrients must be provided.`,
    });
  }

  if (!id) {
    return res.status(400).json({
      message: "Ingredient ID must be provided",
    });
  }
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: `${id} isn't a valid ID.`,
    });
  }

  const ingredient = await Ingredient.findById(id).exec();
  if (!ingredient) {
    return res.status(400).json({
      message: `Ingredient with ID ${id} was not found.`,
    });
  }
  if (!ingredient.user) {
    return res.status(500).json({
      message: `Ingredient ${ingredient.name} doesn't have a user assigned.`,
    });
  }
  if (!ObjectId.isValid(ingredient.user)) {
    return res.status(500).json({
      message: `${ingredient.user} isn't a valid ingredient user ID.`,
    });
  }

  const ingredientUser = await User.findById(ingredient.user).exec();
  if (!ingredientUser) {
    return res.status(500).json({
      message: `Couldn't find user ${ingredientUser.email} assigned to the ingredient ${ingredient.name}`,
    });
  }
  if (req.user !== ingredientUser.email) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (name) {
    ingredient.name = name;
  }
  if (nutrients) {
    ingredient.nutrients = nutrients;
  }
  if (photo) {
    ingredient.photo = photo;
  }

  const updatedIngredient = await ingredient.save();
  return res.status(201).json({
    message: `Ingredient ${updatedIngredient.name} has been updated.`,
  });
};

const deleteIngredient = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Ingredient ID required." });
  }
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      message: `${id} isn't a valid ID.`,
    });
  }

  const ingredient = await Ingredient.findById(id).exec();
  if (!ingredient) {
    return res.status(400).json({
      message: `Ingredient with ID ${id} wasn not found.`,
    });
  }
  if (!ingredient.user) {
    return res.status(400).json({
      message: `Ingredient ${ingredient.name} doesn't have a user assigned.`,
    });
  }
  if (!ObjectId.isValid(ingredient.user)) {
    return res.status(400).json({
      message: `${ingredient.user} isn't a valid ingredient user ID.`,
    });
  }

  const ingredientUser = await User.findById(ingredient.user).lean();
  if (!ingredientUser) {
    return res.status(500).json({
      message: `The user to whom the ingredient ${ingredient.name} is assigned couldn't be found`,
    });
  }
  if (req.user !== ingredientUser.email) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const result = await ingredient.deleteOne();

  return res.json({
    message: `Ingredient ${result.name} has been deleted.`,
  });
};

module.exports = {
  getIngredientById,
  searchIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};
