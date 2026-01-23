const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Import Controllers
const { getUsers, deleteUser, updateUser } = require('../controllers/userController');
const { createAudio, updateAudio, deleteAudio } = require('../controllers/audioController');
const { createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { createVideo, updateVideo, deleteVideo } = require('../controllers/videoController');

// All Admin routes are protected
router.use(protect, admin);

// --- USER MANAGEMENT ---
router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .delete(deleteUser)
  .put(updateUser); // <--- Add this line!

// --- AUDIO MANAGEMENT ---
router.route('/audios')
  .post(createAudio);

router.route('/audios/:id')
  .put(updateAudio)
  .delete(deleteAudio);

// --- CATEGORY MANAGEMENT ---
router.route('/categories')
  .post(createCategory);

router.route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);


router.route('/videos')
  .post(createVideo);      // POST /api/admin/videos (Upload)

router.route('/videos/:id')
  .put(updateVideo)        // PUT /api/admin/videos/:id (Edit)
  .delete(deleteVideo);

module.exports = router;