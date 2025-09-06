// routes/adminRoutes.js
const express = require('express');
const router = express.Router();

// Placeholder for adminController
const adminController = {
  getHeldOrders: (req, res) => res.status(200).json({ message: 'Returns all orders with funds held (placeholder)' }),
  manualRelease: (req, res) => res.status(200).json({ message: 'Manually releases funds for an order (placeholder)' }),
  manualRefund: (req, res) => res.status(200).json({ message: 'Manually refunds an order (placeholder)' }),
};

// Define Admin Routes
router.get('/held-orders', adminController.getHeldOrders);
router.post('/release', adminController.manualRelease);
router.post('/refund', adminController.manualRefund);

module.exports = router;