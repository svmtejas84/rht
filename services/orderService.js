// services/orderService.js
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/db'); // Using mocked DB
const { OrderStatus, DisputeStatus } = require('../models/enums');
const config = require('../config');
const paymentService = require('./paymentService');
const loyaltyService = require('./loyaltyService');
const notificationService = require('./notificationService');

const createOrderFromCart = async (userId, cart) => {
    // 1. Create the order with 'Created' status
    const orderId = uuidv4();
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const total = subtotal; // Assuming no shipping/taxes for now

    const order = {
        id: orderId,
        buyerId: userId,
        sellerId: cart.items[0]?.sellerId, // Assuming single seller for simplicity
        items: cart.items,
        subtotal,
        total,
        status: OrderStatus.CREATED,
        timeline: [{ status: OrderStatus.CREATED, date: new Date() }],
        dispute_status: DisputeStatus.NONE,
        createdAt: new Date(),
    };
    
    // TODO: Implement database logic to save the order
    // await db.orders.create(order);

    // 2. Initiate payment capture
    const paymentIntent = await paymentService.capturePayment(orderId, total);

    // 3. Update order with payment provider ID
    // await db.orders.update(orderId, { provider_payment_id: paymentIntent.id });

    console.log(`Order ${orderId} created, awaiting payment.`);
    return { order, clientSecret: paymentIntent.clientSecret };
};

const handleSuccessfulPayment = async (orderId) => {
    const holdUntil = new Date();
    holdUntil.setDate(holdUntil.getDate() + config.autoReleaseDays);

    const updates = {
        status: OrderStatus.PAID_HELD,
        hold_until: holdUntil,
        timeline: db.pushToArray('timeline', { status: OrderStatus.PAID_HELD, date: new Date() })
    };

    const order = await db.updateOrder(orderId, updates);
    
    // Add pending loyalty points
    await loyaltyService.addPendingPoints(order);
    
    // Notify seller
    await notificationService.notify(order.sellerId, `You have a new order! #${orderId}`);

    console.log(`Order ${orderId} is now ${OrderStatus.PAID_HELD}.`);
    return order;
};

const markAsShipped = async (orderId, sellerId, trackingInfo) => {
    const order = await db.findOrderById(orderId);
    if (order.sellerId !== sellerId) throw new Error("Unauthorized");
    if (order.status !== OrderStatus.PAID_HELD) throw new Error("Order cannot be shipped at its current status.");

    const updates = {
        status: OrderStatus.SHIPPED,
        trackingNumber: trackingInfo.number,
        timeline: db.pushToArray('timeline', { status: OrderStatus.SHIPPED, date: new Date() })
    };
    
    const updatedOrder = await db.updateOrder(orderId, updates);
    await notificationService.notify(order.buyerId, `Your order #${orderId} has shipped!`);
    return updatedOrder;
};

const confirmDelivery = async (orderId, buyerId) => {
    const order = await db.findOrderById(orderId);
    if (order.buyerId !== buyerId) throw new Error("Unauthorized");

    const updates = {
        status: OrderStatus.DELIVERED,
        timeline: db.pushToArray('timeline', { status: OrderStatus.DELIVERED, date: new Date() })
    };
    
    await db.updateOrder(orderId, updates);
    console.log(`Delivery confirmed for order ${orderId}. Triggering release.`);
    
    // Immediately trigger fund release
    const escrowService = require('./escrowService'); // Avoid circular dependency
    await escrowService.releaseFunds(orderId);

    return { message: "Delivery confirmed. Funds will be released to the seller." };
};

const openDispute = async (orderId, buyerId, reason) => {
    const order = await db.findOrderById(orderId);
    if (order.buyerId !== buyerId) throw new Error("Unauthorized");
    if (![OrderStatus.PAID_HELD, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status)) {
        throw new Error("Dispute cannot be opened for this order status.");
    }

    const updates = {
        dispute_status: DisputeStatus.OPEN,
        dispute_reason: reason,
        timeline: db.pushToArray('timeline', { status: `Dispute Opened`, date: new Date(), reason })
    };

    return await db.updateOrder(orderId, updates);
};

module.exports = {
    createOrderFromCart,
    handleSuccessfulPayment,
    markAsShipped,
    confirmDelivery,
    openDispute,
};