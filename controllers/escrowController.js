// controllers/escrowController.js
const orderService = require('../services/orderService');
const escrowService = require('../services/escrowService');

const handlePaymentWebhook = async (req, res) => {
    const event = req.body;

    // Securely verify the webhook signature here

    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            const orderId = paymentIntent.metadata.orderId;
            await orderService.handleSuccessfulPayment(orderId);
            break;
        case 'charge.refunded':
            // Handle refund confirmation if needed
            break;
        case 'payout.paid':
            // Handle payout confirmation if needed
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
};

module.exports = {
    handlePaymentWebhook,
};