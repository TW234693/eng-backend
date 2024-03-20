const User = require("../models/Users");

const getAllUsers = async (_, res) => {
  const users = await User.find().select("-password").lean();
  if (!users || users.length <= 0) {
    return res.status(400).json({ message: "No users found." });
  }
  return res.json(users);
};

const searchUsers = async (req, res) => {
  const { query } = req.params;
  const queryTokens = query.split(" ");
  const regexBase = queryTokens.reduce((acc, val) => {
    if (val !== queryTokens[0]) {
      acc = `${acc}|${val}`;
    }
    return acc;
  }, queryTokens[0]);

  const regex = new RegExp(regexBase, "i");

  const users = await User.find({
    $or: [
      { name: { $regex: regex } },
      { email: { $regex: regex } },
      { surname: { $regex: regex } },
      { description: { $regex: regex } },
    ],
  })
    .select("-password")
    .lean();

  if (!users || users.length <= 0) {
    return res.status(400).json({ message: "No users found." });
  }
  return res.json(users);
};

const getUserByEmail = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({
      message: "User email must be provided.",
    });
  }

  const user = await User.findOne({ email: email }).select("-password").lean();
  if (!user) {
    return res
      .status(400)
      .json({ message: `No user with email ${email} was found.` });
  }
  return res.json({
    ...user,
  });
};

module.exports = {
  getAllUsers,
  getUserByEmail,
  searchUsers,
};
