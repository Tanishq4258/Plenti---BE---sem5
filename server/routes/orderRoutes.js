const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getStoreOrders,
  updateOrderStatus,
  verifyPickupCode
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/store-orders', protect, authorize('business', 'admin'), getStoreOrders);
router.patch('/:id/status', protect, authorize('business', 'admin'), updateOrderStatus);
router.post('/verify-code', protect, authorize('business', 'admin'), verifyPickupCode);

module.exports = router;
