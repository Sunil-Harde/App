const mongoose = require('mongoose');

const journalSchema = mongoose.Schema(
  {

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    content: {
      type: String,
      required: true
    },

    mood: {
      type: String,
      default: 'Neutral'

    }, // e.g., Happy, Sad, Neutral
  },

  {
    timestamps: true
  });

module.exports = mongoose.model('Journal', journalSchema);