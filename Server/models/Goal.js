const mongoose = require('mongoose');

const goalSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Please add a goal title'],
    },
    // The strict deadline
    deadline: {
      type: Date,
      required: true
    },
    // When the user *plans* to complete it (optional, can be same as deadline)
    targetDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Completed'],
      default: 'Active',
    },
    // Helper to know if we already sent an alert
    notificationSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Goal', goalSchema);