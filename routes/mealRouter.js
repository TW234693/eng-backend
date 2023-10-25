const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController')

router.route('/getMeal/id=:id').get(mealController.getMealById) // no req body
router.route('/createMeal/clientEmail=:clientEmail').post(mealController.createMeal) // {name, instructions, minutesCookingTime, mealDate, ingredients}
router.route('/updateMeal/id=:id').patch(mealController.updateMeal) // {name?, instructions?, minutesCookingTime?, mealDate?, ingredients?}
router.route('/deleteMeal/id=:id').delete(mealController.deleteMeal) // no req body

module.exports = router;