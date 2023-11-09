const express = require('express');
const loginLimiter = require('../middleware/loginLimiter')
const authController = require('../controllers/authController')

const router = express.Router();

// router.route('/login').post(loginLimiter, authController.login)
router.route('/login').post(authController.login) // {email, password}
router.route('/refresh').get(authController.refresh) // cookies
router.route('/logout').post(authController.logout) // cookies

module.exports = router