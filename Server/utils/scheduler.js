const cron = require('node-cron');
const Goal = require('../models/Goal');

const startGoalScheduler = () => {
  // Run every hour: '0 * * * *'
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Checking for nearing goal deadlines...');
    
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // 24 hours from now

    try {
      // Find active goals due within 24 hours that haven't been notified yet
      const nearingGoals = await Goal.find({
        status: 'Active',
        notificationSent: false,
        deadline: {
          $gte: now,
          $lte: tomorrow
        }
      });

      for (const goal of nearingGoals) {
        // Here you would typically send an Email or Push Notification
        // For now, we simulate it with a log
        console.log(`🔔 ALERT: Goal "${goal.title}" is due soon! (${goal.deadline})`);
        
        // Mark as notified so we don't spam
        goal.notificationSent = true;
        await goal.save();
      }
      
    } catch (error) {
      console.error('Scheduler Error:', error);
    }
  });
};

module.exports = startGoalScheduler;