const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    color: {
      type: String,
      default: 'blue'

    }, // For UI styling (e.g., 'blue', 'green')
  },
  
  {
    timestamps: true
  });

module.exports = mongoose.model('Category', categorySchema);