const Video = require('../models/Video');

// @desc    Get all videos (Public)
// @route   GET /api/videos
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({}).sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos' });
  }
};

// @desc    Create new video (Admin)
// @route   POST /api/admin/videos
const createVideo = async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, duration, category } = req.body;

    if (!title || !videoUrl || !duration || !category) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      category,
    });

    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update video (Admin)
// @route   PUT /api/admin/videos/:id
const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (video) {
      video.title = req.body.title || video.title;
      video.description = req.body.description || video.description;
      video.videoUrl = req.body.videoUrl || video.videoUrl;
      video.thumbnailUrl = req.body.thumbnailUrl || video.thumbnailUrl;
      video.duration = req.body.duration || video.duration;
      video.category = req.body.category || video.category;

      const updatedVideo = await video.save();
      res.json(updatedVideo);
    } else {
      res.status(404).json({ message: 'Video not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete video (Admin)
// @route   DELETE /api/admin/videos/:id
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (video) {
      await video.deleteOne();
      res.json({ message: 'Video removed' });
    } else {
      res.status(404).json({ message: 'Video not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVideos,
  createVideo,
  updateVideo,
  deleteVideo,
};