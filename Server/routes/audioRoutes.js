const express = require('express');
const router = express.Router();
const { getAudios } = require('../controllers/audioController');

// Public: Anyone can see the list of audios
router.get('/', getAudios); 

module.exports = router;