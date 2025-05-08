// cronJobs.js
try {
  const cron = require('node-cron');
  const InventoryAI = require('./Controllers/InventoryAIController');

  // Run every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running auto-replenishment check...');
    try {
      const result = await InventoryAI.autoReplenishCheck();
      console.log(`Auto-replenishment processed ${result.processed} items`);
    } catch (error) {
      console.error('Error in auto-replenishment:', error);
    }
  });

  console.log('✅ Cron jobs initialized');
  module.exports = cron;
} catch (error) {
  console.error('❌ Failed to initialize cron jobs:', error.message);
  module.exports = null;
}