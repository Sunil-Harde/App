const express = require('express');
const router = express.Router();
const { getVideos } = require('../controllers/videoController');

// Public Route: Anyone can see the list
router.get('/', getVideos);

module.exports = router;