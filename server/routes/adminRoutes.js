const express = require('express');
const router = express.Router();
const {
  getOverview,
  getAllBusinesses,
  updateBusinessStatus,
  getAllCustomers,
  updateCustomerStatus
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/overview', getOverview);
router.get('/businesses', getAllBusinesses);
router.patch('/businesses/:id/status', updateBusinessStatus);
router.get('/customers', getAllCustomers);
router.patch('/customers/:id/status', updateCustomerStatus);

module.exports = router;
