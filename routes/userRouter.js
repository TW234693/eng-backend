const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

router.route('/').get(userController.getAllUsers)
router.route('/').post(userController.createNewUser)
router.route('/:id').delete(userController.deleteUser)
router.route('/:id').patch(userController.updateUser)
router.route('/:id').get(userController.getUserById)

module.exports = router;