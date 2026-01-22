const express = require('express');
const router = express.Router();
const { getJournals, createJournal, deleteJournal } = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/').get(getJournals).post(createJournal);
router.route('/:id').delete(deleteJournal);

module.exports = router;