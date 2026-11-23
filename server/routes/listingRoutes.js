const express = require('express');
const router = express.Router();
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  updateStock
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getListings);
router.get('/:id', getListingById);
router.post('/', protect, authorize('business', 'admin'), createListing);
router.put('/:id', protect, authorize('business', 'admin'), updateListing);
router.delete('/:id', protect, authorize('business', 'admin'), deleteListing);
router.patch('/:id/stock', protect, authorize('business', 'admin'), updateStock);

module.exports = router;
