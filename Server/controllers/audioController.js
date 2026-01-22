const Audio = require('../models/Audio');

// @desc    Get all audios
// @route   GET /api/audios
const getAudios = async (req, res) => {
  try {
    const audios = await Audio.find({}).sort({ createdAt: -1 });
    res.json(audios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new audio
// @route   POST /api/audios
const createAudio = async (req, res) => {
  try {
    const { title, category, duration, imageUrl, audioUrl } = req.body;

    // 1. Check for missing data
    if (!title || !category || !duration || !imageUrl || !audioUrl) {
      console.log("Missing Fields:", req.body); // DEBUG
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // 2. Create in DB
    const audio = new Audio({
      title,
      category,
      duration,
      imageUrl,
      audioUrl,
    });

    const createdAudio = await audio.save();
    res.status(201).json(createdAudio);

  } catch (error) {
    console.error("Error creating audio:", error); // DEBUG
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Delete audio
// @route   DELETE /api/audios/:id
const deleteAudio = async (req, res) => {
  try {
    const audio = await Audio.findById(req.params.id);

    if (audio) {
      await audio.deleteOne();
      res.json({ message: 'Audio removed' });
    } else {
      res.status(404).json({ message: 'Audio not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update audio
// @route   PUT /api/audios/:id
const updateAudio = async (req, res) => {
  try {
    const { title, category, duration, imageUrl, audioUrl } = req.body;
    const audio = await Audio.findById(req.params.id);

    if (audio) {
      audio.title = title || audio.title;
      audio.category = category || audio.category;
      audio.duration = duration || audio.duration;
      audio.imageUrl = imageUrl || audio.imageUrl;
      audio.audioUrl = audioUrl || audio.audioUrl;

      const updatedAudio = await audio.save();
      res.json(updatedAudio);
    } else {
      res.status(404).json({ message: 'Audio not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAudios, createAudio, deleteAudio, updateAudio };