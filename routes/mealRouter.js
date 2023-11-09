const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController')
const verifyJWT = require('../middleware/verifyJWT')

router.route('/getMeal/id=:id').get(mealController.getMealById) // AUTH no req body

router.use(verifyJWT)
router.route('/createMeal/clientEmail=:clientEmail').post(mealController.createMeal) // AUTH {name, instructions, minutesCookingTime, mealDate, ingredients}
router.route('/updateMeal/id=:id').patch(mealController.updateMeal) // AUTH {name?, instructions?, minutesCookingTime?, mealDate?, ingredients?}
router.route('/deleteMeal/id=:id').delete(mealController.deleteMeal) // AUTH no req body

module.exports = router;