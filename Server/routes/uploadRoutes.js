const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();

// 1. Storage Engine
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename(req, file, cb) {
    // Name format: fieldname-date.extension (e.g., video-123456789.mp4)
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// 2. Check File Type (Images OR Videos)
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|mp4|mkv|mov|avi/; // Allowed extensions
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Only Images and Videos are allowed!');
  }
}

// 3. Init Upload
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// 4. Route
router.post('/', upload.single('image'), (req, res) => {
  // 'image' is the key name we send from frontend, but it handles videos too
  res.send(`/${req.file.path.replace(/\\/g, '/')}`); // Return the path (e.g., /uploads/video-123.mp4)
});

module.exports = router;