// controllers/orderController.js
const orderService = require('../services/orderService');

const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id; // From auth middleware
        const { cart } = req.body;
        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty." });
        }
        const result = await orderService.createOrderFromCart(userId, cart);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

const confirmDelivery = async (req, res, next) => {
    try {
        const { id: orderId } = req.params;
        const userId = req.user.id;
        const result = await orderService.confirmDelivery(orderId, userId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const openDispute = async (req, res, next) => {
    try {
        const { id: orderId } = req.params;
        const userId = req.user.id;
        const { reason } = req.body;
        const order = await orderService.openDispute(orderId, userId, reason);
        res.status(200).json(order);
    } catch (error) {
        next(error);
    }
};

// Add other controllers for GET /orders, GET /orders/:id etc.

module.exports = {
    createOrder,
    confirmDelivery,
    openDispute,
};