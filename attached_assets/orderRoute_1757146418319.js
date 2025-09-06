// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth'); // Placeholder auth middleware

// This endpoint is effectively the "checkout"
router.post('/', protect, orderController.createOrder);

// User confirms they have received the item
router.post('/:id/confirm-delivery', protect, orderController.confirmDelivery);

// User opens a dispute
router.post('/:id/open-dispute', protect, orderController.openDispute);

// Other order routes...
// router.get('/', protect, orderController.getUserOrders);
// router.get('/:id', protect, orderController.getOrderById);

module.exports = router;