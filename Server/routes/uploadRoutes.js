const path = require('path');
const express = require('express');
const multer = require('multer');

const router = express.Router();

// Configure Storage (Where to save files)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // Files will be saved in 'uploads' folder
  },
  filename(req, file, cb) {
    // Rename file to avoid duplicates: fieldname-date.extension
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Check File Type (Security)
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|mp3|mpeg/; // Allowed extensions
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images and MP3 Audio Only!');
  }
}

// Upload Middleware
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Route: POST /api/upload
// Handles single file upload with field name "image" (reused for audio)
router.post('/', upload.single('image'), (req, res) => {
  if (req.file) {
    res.send(`/${req.file.path.replace(/\\/g, "/")}`); // Return the path
  } else {
    res.status(400).send('No file uploaded');
  }
});

module.exports = router;