// routes/sellerRoutes.js
const express = require('express');
const router = express.Router();

// Placeholder for sellerController
const sellerController = {
  onboardSeller: (req, res) => res.status(200).json({ message: 'Starts seller KYC onboarding (placeholder)' }),
  getPayoutStatus: (req, res) => res.status(200).json({ message: 'Returns seller payout status (placeholder)' }),
  getPayoutHistory: (req, res) => res.status(200).json({ message: 'Returns seller payout history (placeholder)' })
};

// These routes are for seller-specific payout actions
router.post('/onboard', sellerController.onboardSeller);
router.get('/status', sellerController.getPayoutStatus);
router.get('/history', sellerController.getPayoutHistory);

module.exports = router;