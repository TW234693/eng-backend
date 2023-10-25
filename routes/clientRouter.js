const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController')

router.route('/getClient/email=:email').get(clientController.getClientByEmail) // no req body
router.route('/getMeals/email=:email').get(clientController.getClientMeals) // no req body
router.route('/createClient').post(clientController.createClient) // {password, email, name, surname}
router.route('/deleteClient/email=:email').delete(clientController.deleteClient) // no req body
router.route('/updateClient/email=:email').patch(clientController.updateClient) // {password?, name?, surname?}
router.route('/unassign/email=:email').patch(clientController.unassignClient) // no req body

module.exports = router;