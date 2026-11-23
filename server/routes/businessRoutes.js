const express = require('express');
const router = express.Router();
const {
  getBusinesses,
  getBusinessById,
  getMyBusinessStats,
  updateMyProfile
} = require('../controllers/businessController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getBusinesses);
router.get('/current/stats', protect, authorize('business', 'admin'), getMyBusinessStats);
router.put('/current/profile', protect, authorize('business', 'admin'), updateMyProfile);
router.get('/:id', getBusinessById);

module.exports = router;
