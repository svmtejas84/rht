// routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// Placeholder for orderController
const orderController = {
  createOrder: (req, res) => res.status(201).json({ message: 'Order created (placeholder)' }),
  confirmDelivery: (req, res) => res.status(200).json({ message: `Delivery confirmed for order ${req.params.id} (placeholder)` }),
  openDispute: (req, res) => res.status(200).json({ message: `Dispute opened for order ${req.params.id} (placeholder)` }),
};

// This endpoint is effectively the "checkout"
router.post('/', orderController.createOrder);

// User confirms they have received the item
router.post('/:id/confirm-delivery', orderController.confirmDelivery);

// User opens a dispute
router.post('/:id/open-dispute', orderController.openDispute);

module.exports = router;