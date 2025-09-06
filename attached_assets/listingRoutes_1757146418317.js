// routes/listingRoutes.js
const express = require('express');
const router = express.Router();

// Placeholder for listingController
const listingController = {
  getListings: (req, res) => res.status(200).json({ message: 'Returns all listings (placeholder)' }),
  getListingById: (req, res) => res.status(200).json({ message: `Returns listing with id ${req.params.id} (placeholder)` }),
  createListing: (req, res) => res.status(201).json({ message: 'Creates a new listing (placeholder)' }),
  updateListing: (req, res) => res.status(200).json({ message: `Updates listing with id ${req.params.id} (placeholder)` }),
  deleteListing: (req, res) => res.status(200).json({ message: `Deletes listing with id ${req.params.id} (placeholder)` }),
};

// Define Listing Routes
router.get('/', listingController.getListings);
router.get('/:id', listingController.getListingById);
router.post('/', listingController.createListing);
router.patch('/:id', listingController.updateListing);
router.delete('/:id', listingController.deleteListing);

module.exports = router;