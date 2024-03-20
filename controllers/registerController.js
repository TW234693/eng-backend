const User = require("../models/Users");
const Client = require("../models/Clients");
const bcrypt = require("bcrypt");
const mailing = require("../nodemailer/nodemailer");

const createAccount = async (req, res) => {
  const { password, email, name, surname, description, isClient, locale } =
    req.body;

  if (!password || !email || !name || !surname || !locale) {
    return res
      .status(400)
      .json({
        message: "Name, surname, email, password, and locale are required.",
      });
  }

  const duplicateUser = await User.findOne({ email }).lean().exec();
  const duplicateClient = await Client.findOne({ email }).lean().exec();
  if (duplicateUser || duplicateClient) {
    return res.status(409).json({
      messsage:
        locale === "pl"
          ? `Ten adres email jest już zajęty.`
          : `This email address is already taken.`,
    });
  }

  try {
    const hashPassowrd = await bcrypt.hash(password, 10); //salt rounds
    const accountObject = {
      email,
      password: hashPassowrd,
      name,
      surname,
      active: false,
    };

    const fullName = `${name} ${surname}`;
    const activationLinkBase = `http://localhost:3000/activate/`;
    const message = "createAccount_success";
    let id = "";

    if (isClient) {
      const createdClient = await Client.create(accountObject);
      id = createdClient._id;
    } else {
      if (description) {
        accountObject.description = description;
      }
      const createdUser = await User.create(accountObject);
      id = createdUser._id;
    }

    await mailing.sendActivationEmail(
      fullName,
      email,
      activationLinkBase + id,
      locale
    );
    return res.status(200).json({
      message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAccount,
};
