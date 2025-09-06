// services/paymentService.js
// --- MOCKED PAYMENT PROVIDER SERVICE ---
// In a real application, you would integrate a payment SDK here.

console.log("Mock Payment Service Initialized");

const capturePayment = async (orderId, amount) => {
    console.log(`[Payment Mock] Capturing payment of ₹${amount} for order ${orderId}`);
    // Simulate a successful payment intent creation
    return Promise.resolve({
        success: true,
        id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        clientSecret: `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`,
        message: "Payment captured successfully (mocked)."
    });
};

const payoutToSeller = async (sellerAccountId, amount) => {
    console.log(`[Payment Mock] Initiating payout of ₹${amount} to seller ${sellerAccountId}`);
    // Simulate a successful payout
    return Promise.resolve({
        success: true,
        id: `po_${Math.random().toString(36).substr(2, 9)}`,
        message: "Payout to seller successful (mocked)."
    });
};

const createRefund = async (paymentIntentId, amount) => {
    console.log(`[Payment Mock] Refunding ₹${amount} for payment ${paymentIntentId}`);
    // Simulate a successful refund
    return Promise.resolve({
        success: true,
        id: `re_${Math.random().toString(36).substr(2, 9)}`,
        status: 'succeeded',
        message: "Refund processed successfully (mocked)."
    });
};

module.exports = {
    capturePayment,
    payoutToSeller,
    createRefund,
};