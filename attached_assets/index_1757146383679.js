// config/index.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  platformFeePercentage: 0.10, // 10% platform fee
  autoReleaseDays: 14, // Auto-release funds after 14 days
  loyalty: {
    pointValueInRupees: 1, // 1 point = ₹1
    tiers: [
      { spendThreshold: 30000, earnRate: 0.05 }, // 5%
      { spendThreshold: 10000, earnRate: 0.02 }, // 2%
      { spendThreshold: 0, earnRate: 0.01 },       // 1%
    ],
    tierEvaluationPeriodDays: 365,
  },
  giveback: {
    rupeesPerTree: 50, // ₹50 to plant one tree
  }
};