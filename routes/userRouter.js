const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/getClients/email=:email').get(userController.getUserClients) // no req body AUTH
router.route('/assign').patch(userController.assignClient) // {userEmail, clientEmail} AUTH
router.route('/deleteUser/email=:email').delete(userController.deleteUser) // no req body AUTH
router.route('/updateUser/email=:email').patch(userController.updateUser) // {password, name, surname, description} AUTH
router.route('/updateNotes/userEmail=:userEmail&clientEmail=:clientEmail').patch(userController.updateClientNotes) // {notes} AUTH

module.exports = router;