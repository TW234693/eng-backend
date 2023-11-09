const express = require('express');
const searchController = require('../controllers/searchController')

const router = express.Router();

router.route('/').get(searchController.getAllUsers) // no req body 
router.route('/q=:query').get(searchController.searchUsers) // no req body
router.route('/email=:email').get(searchController.getUserByEmail) // no req body

module.exports = router