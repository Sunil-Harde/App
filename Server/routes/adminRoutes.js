const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Import All Controllers
const { getUsers, deleteUser } = require('../controllers/userController');
const { createAudio, updateAudio, deleteAudio } = require('../controllers/audioController');
const { createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

// --- APPLY ADMIN SECURITY GLOBALLY ---
// Every route below this line requires a valid Token AND Admin privileges
router.use(protect, admin);

// --- 1. USER MANAGEMENT ---
router.route('/users')
  .get(getUsers);          // GET /api/admin/users (View all users)

router.route('/users/:id')
  .delete(deleteUser);     // DELETE /api/admin/users/:id (Ban user)

// --- 2. AUDIO MANAGEMENT ---
router.route('/audios')
  .post(createAudio);      // POST /api/admin/audios (Upload)

router.route('/audios/:id')
  .put(updateAudio)        // PUT /api/admin/audios/:id (Edit)
  .delete(deleteAudio);    // DELETE /api/admin/audios/:id (Remove)

// --- 3. CATEGORY MANAGEMENT ---
router.route('/categories')
  .post(createCategory);   // POST /api/admin/categories

router.route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router;