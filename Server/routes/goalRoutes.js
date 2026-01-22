const express = require('express');
const router = express.Router();
const { 
  getGoals, 
  createGoal, 
  deleteGoal, 
  updateGoal // <--- Changed from toggleGoalStatus
} = require('../controllers/goalController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getGoals)
  .post(createGoal);

router.route('/:id')
  .delete(deleteGoal)
  .put(updateGoal); // <--- Use the new general update function

module.exports = router;