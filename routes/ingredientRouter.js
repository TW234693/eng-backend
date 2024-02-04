const express = require("express");
const router = express.Router();
const ingredientController = require("../controllers/ingredientController");
const verifyJWT = require("../middleware/verifyJWT");

router.use(verifyJWT);
router
  .route("/getIngredient/id=:id")
  .get(ingredientController.getIngredientById); // AUTH no req body
router.route("/search/q=:query").get(ingredientController.searchIngredients); // AUTH {no req body}

router.route("/createIngredient").post(ingredientController.createIngredient); // AUTH {name, nutrients}
router
  .route("/updateIngredient/id=:id")
  .patch(ingredientController.updateIngredient); // AUTH {name?, photo?, nutrients?}
router
  .route("/deleteIngredient/id=:id")
  .delete(ingredientController.deleteIngredient); // AUTH no req body

module.exports = router;
