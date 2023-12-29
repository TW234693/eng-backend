const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);

router.route("/getClient/email=:email").get(clientController.getClientByEmail); // no req body AUTH
router.route("/getMeals/email=:email").get(clientController.getClientMeals); // no req body AUTH
router
  .route("/deleteClient/email=:email")
  .delete(clientController.deleteClient); // no req body AUTH
router.route("/updateClient/email=:email").patch(clientController.updateClient); // {password?, name?, surname?} AUTH
router.route("/unassign/email=:email").patch(clientController.unassignClient); // no req body AUTH

module.exports = router;
