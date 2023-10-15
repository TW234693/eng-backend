const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

router.route('/getAllUsers').get(userController.getAllUsers)
router.route('/getUser/id=:id').get(userController.getUserById)
router.route('/getClients/id=:id').get(userController.getUserClients)
router.route('/createUser').post(userController.createUser)
router.route('/deleteUser/id=:id').delete(userController.deleteUser)
router.route('/updateUser/id=:id').patch(userController.updateUser)

module.exports = router;