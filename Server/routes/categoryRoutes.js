const express = require('express');
const router = express.Router();
const { getCategories } = require('../controllers/categoryController');

// Public: Anyone can see categories
router.get('/', getCategories);

module.exports = router;