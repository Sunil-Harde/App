const mongoose = require('mongoose');

const videoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    videoUrl: { // URL to the video file (e.g., /uploads/video.mp4)
      type: String,
      required: true,
    },
    thumbnailUrl: { // URL to the cover image
      type: String,
    },
    duration: {
      type: String, // e.g., "10:05"
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    isPremium: {
      type: Boolean,
      default: false, // For future paid features
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Video', videoSchema);