// routes/cartRoutes.js
const express = require('express');
const router = express.Router();

// Placeholder for cartController
const cartController = {
  getCart: (req, res) => res.status(200).json({ message: 'Returns the user cart (placeholder)' }),
  addItemToCart: (req, res) => res.status(201).json({ message: 'Adds an item to the cart (placeholder)' }),
  deleteCartItem: (req, res) => res.status(200).json({ message: `Deletes item ${req.params.listingId} from cart (placeholder)` }),
  clearCart: (req, res) => res.status(200).json({ message: 'Clears all items from the cart (placeholder)' }),
};

// Define Cart Routes
router.get('/', cartController.getCart);
router.post('/items', cartController.addItemToCart);
router.delete('/items/:listingId', cartController.deleteCartItem);
router.post('/clear', cartController.clearCart);


module.exports = router;