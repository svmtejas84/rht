// services/escrowService.js
const db = require('../utils/db');
const { OrderStatus, DisputeStatus } = require('../models/enums');
const loyaltyService = require('./loyaltyService');
const paymentService = require('./paymentService');
const config = require('../config');
const notificationService = require('./notificationService');

const releaseFunds = async (orderId, isAdminOverride = false) => {
    const order = await db.findOrderById(orderId);
    const seller = await db.findUserById(order.sellerId);

    // Rule 1: Cannot release if a dispute is open
    if (order.dispute_status === DisputeStatus.OPEN && !isAdminOverride) {
        console.log(`Release for order ${orderId} blocked due to open dispute.`);
        return { success: false, message: "Release blocked by open dispute." };
    }

    // Rule 2: Seller must have KYC completed
    if (!seller.payout_enabled) {
        console.log(`Release for order ${orderId} on hold. Seller payouts not enabled.`);
        // You might want to queue this or notify the seller
        return { success: false, message: "Seller has not completed payout onboarding." };
    }
    
    // Rule 3: Must be in a releasable state
    if (![OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PAID_HELD].includes(order.status)) {
        console.log(`Order ${orderId} is not in a releasable state.`);
        return { success: false, message: "Order is not in a releasable state." };
    }

    // Perform payout to seller
    const platformFee = order.total * config.platformFeePercentage;
    const amountToSeller = order.total - platformFee;
    
    const payout = await paymentService.payoutToSeller(seller.connected_account_id, amountToSeller);

    // Update order and create payout record
    const updates = {
        status: OrderStatus.RELEASED,
        timeline: db.pushToArray('timeline', { status: OrderStatus.RELEASED, date: new Date() })
    };
    await db.updateOrder(orderId, updates);
    // TODO: Create payout record in DB
    // await db.payouts.create({ orderId, sellerId: order.sellerId, amount_to_seller, platform_fee, ... });
    
    // Make loyalty points available to the buyer
    await loyaltyService.makePointsAvailable(orderId);

    await notificationService.notify(order.sellerId, `Funds for order #${orderId} have been released to your account.`);

    console.log(`Successfully released funds for order ${orderId}.`);
    return { success: true, message: "Funds released." };
};

const refundOrder = async (orderId, amount, reason, isAdminOverride = false) => {
    const order = await db.findOrderById(orderId);
    
    // Perform refund via payment provider
    const refund = await paymentService.createRefund(order.provider_payment_id, amount);

    if (refund.status === 'succeeded') {
        const updates = {
            status: OrderStatus.REFUNDED,
            refund_info: { amount, reason, date: new Date() },
            timeline: db.pushToArray('timeline', { status: OrderStatus.REFUNDED, date: new Date(), amount })
        };
        await db.updateOrder(orderId, updates);

        // Reverse loyalty points
        await loyaltyService.reversePointsForOrder(order);

        await notificationService.notify(order.buyerId, `Your order #${orderId} has been refunded.`);
        console.log(`Successfully refunded ${amount} for order ${orderId}.`);
        return { success: true, message: "Refund processed successfully." };
    }

    return { success: false, message: "Refund failed at payment provider." };
};

module.exports = {
    releaseFunds,
    refundOrder
};