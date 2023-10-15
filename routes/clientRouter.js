const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController')

router.route('/getClient/id=:id').get(clientController.getClientById)
router.route('/getMeals/id=:id').get(clientController.getClientMeals)
router.route('/createClient/userId=:userId').post(clientController.createClient)
router.route('/deleteClient/id=:id').delete(clientController.deleteClient)
router.route('/updateClient/id=:id').patch(clientController.updateClient)

module.exports = router;