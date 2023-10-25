const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

router.route('/getAllUsers').get(userController.getAllUsers) // no req body
router.route('/search/q=:query').get(userController.searchUsers) // no req body
router.route('/getUser/email=:email').get(userController.getUserByEmail) // no req body
router.route('/getClients/email=:email').get(userController.getUserClients) // no req body
router.route('/assign').patch(userController.assignClient) // {userEmail, clientEmail}
router.route('/createUser').post(userController.createUser) // {password, email, name, surname, description, rating=0, ratingsCount=0}
router.route('/deleteUser/email=:email').delete(userController.deleteUser) // no req body
router.route('/updateUser/email=:email').patch(userController.updateUser) // {password, name, surname, description}
router.route('/updateNotes/userEmail=:userEmail&clientEmail=:clientEmail').patch(userController.updateClientNotes) // {notes}

module.exports = router;