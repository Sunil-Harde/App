const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');

// 0. Ensure 'uploads' folder exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// 1. Storage Configuration (Local Disk)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    // Unique filename: fieldname-timestamp.extension
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// 2. Strict File Filter
function checkFileType(file, cb, req) {
  const type = req.query.type; // Get 'video', 'audio', or 'image' from URL

  const imageExts = /jpg|jpeg|png|webp/;
  const videoExts = /mp4|mkv|mov/;
  const audioExts = /mp3|mpeg|wav/;

  let allowedRegex;
  let errorMsg = 'Invalid file type!';

  if (type === 'video') {
    allowedRegex = videoExts;
    errorMsg = '⛔ Error: Only Video files (MP4, MKV) are allowed!';
  } else if (type === 'audio') {
    allowedRegex = audioExts;
    errorMsg = '⛔ Error: Only Audio files (MP3, WAV) are allowed!';
  } else if (type === 'image') {
    allowedRegex = imageExts;
    errorMsg = '⛔ Error: Only Image files (JPG, PNG) are allowed!';
  } else {
    allowedRegex = /jpg|jpeg|png|webp|mp4|mkv|mov|mp3|mpeg|wav/;
  }

  const extname = allowedRegex.test(path.extname(file.originalname).toLowerCase());
  // Relaxed mimetype check for local dev/Render
  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error(errorMsg));
  }
}

// 3. Init Multer
const upload = multer({
  storage,
  limits: { fileSize: 500000000 }, // 500MB Limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb, req);
  },
}).single('image');

// 4. Route
router.post('/', (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    // Return the path (e.g., "/uploads/image-123.png")
    res.send(`/${req.file.path.replace(/\\/g, '/')}`);
  });
});

module.exports = router;