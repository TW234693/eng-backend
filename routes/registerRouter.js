const express = require("express");
const registerController = require("../controllers/registerController");

const router = express.Router();

router.route("/").post(registerController.createAccount); // {name, surname, email, password, isClient, description?}

module.exports = router;
