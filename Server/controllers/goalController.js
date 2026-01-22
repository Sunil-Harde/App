const Goal = require('../models/Goal');

// @desc    Get User's Goals
// @route   GET /api/goals
const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals' });
  }
};

// @desc    Create Goal
// @route   POST /api/goals
const createGoal = async (req, res) => {
  try {
    const { title, deadline, targetDate } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({ message: 'Title and Deadline are required' });
    }

    const goal = await Goal.create({
      user: req.user.id,
      title,
      deadline,
      targetDate: targetDate || deadline,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Goal
// @route   DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await goal.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Goal (Status OR Details)
// @route   PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update Logic
    if (req.body.status) {
      // If just toggling status
      goal.status = req.body.status;
    } else if (req.body.title || req.body.deadline) {
      // If editing details
      goal.title = req.body.title || goal.title;
      goal.deadline = req.body.deadline || goal.deadline;
      goal.targetDate = req.body.targetDate || goal.targetDate;
    } else {
      // Fallback toggle
      goal.status = goal.status === 'Active' ? 'Completed' : 'Active';
    }

    const updatedGoal = await goal.save();
    res.status(200).json(updatedGoal);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EXPORT ALL FUNCTIONS
module.exports = {
  getGoals,   // <--- This was missing before!
  createGoal,
  deleteGoal,
  updateGoal,
};