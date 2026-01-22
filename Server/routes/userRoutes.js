const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

// --- PUBLIC ROUTES (No Token) ---
router.post('/register', registerUser); // POST /api/user/register
router.post('/login', authUser);        // POST /api/user/login

// --- PROTECTED ROUTES (Token Required) ---
router.route('/profile')
  .get(protect, getUserProfile)      // GET /api/user/profile
  .put(protect, updateUserProfile);  // PUT /api/user/profile

module.exports = router;