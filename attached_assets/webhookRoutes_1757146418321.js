// routes/webhookRoutes.js
const express = require('express');
const router = express.Router();
const escrowController = require('../controllers/escrowController');

// Endpoint for payment provider webhooks (e.g., Stripe, PayPal)
router.post('/payment', escrowController.handlePaymentWebhook);

module.exports = router;