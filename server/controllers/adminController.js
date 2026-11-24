const User = require('../models/User');
const Business = require('../models/Business');
const Listing = require('../models/Listing');
const Order = require('../models/Order');

// @desc    Get platform administrative overview metrics
// @route   GET /api/admin/overview
// @access  Private (Admin)
exports.getOverview = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalBusinesses = await Business.countDocuments();
    const activeListings = await Listing.countDocuments({ status: 'active' });
    const totalOrders = await Order.countDocuments();
    const pendingVerifications = await Business.countDocuments({ verificationStatus: 'pending' });

    // Aggregate revenue
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Aggregate food saved
    const foodSavedResult = await Business.aggregate([
      { $group: { _id: null, total: { $sum: '$totalFoodRescuedKg' } } }
    ]);
    const totalFoodSavedKg = foodSavedResult[0]?.total || 0;

    const recentOrders = await Order.find()
      .populate('customer', 'name email')
      .populate('business', 'businessName')
      .sort({ createdAt: -1 })
      .limit(6);

    const recentBusinesses = await Business.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        totalBusinesses,
        activeListings,
        totalOrders,
        totalRevenue,
        totalFoodSavedKg,
        pendingVerifications,
        recentOrders,
        recentBusinesses
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all businesses for admin management
// @route   GET /api/admin/businesses
// @access  Private (Admin)
exports.getAllBusinesses = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    let query = {};

    if (status && status !== 'all') {
      if (['verified', 'pending', 'rejected'].includes(status)) {
        query.verificationStatus = status;
      } else {
        query.status = status;
      }
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.businessName = { $regex: search, $options: 'i' };
    }

    const businesses = await Business.find(query)
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update business verification / active status
// @route   PATCH /api/admin/businesses/:id/status
// @access  Private (Admin)
exports.updateBusinessStatus = async (req, res) => {
  try {
    const { verificationStatus, status } = req.body;
    const business = await Business.findById(req.params.id);

    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    if (verificationStatus) {
      business.verificationStatus = verificationStatus;
    }
    if (status) {
      business.status = status;
    }

    await business.save();

    res.status(200).json({
      success: true,
      message: 'Business status updated successfully',
      data: business
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all platform customers
// @route   GET /api/admin/customers
// @access  Private (Admin)
exports.getAllCustomers = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = { role: 'customer' };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update customer status (Suspend / Reactivate)
// @route   PATCH /api/admin/customers/:id/status
// @access  Private (Admin)
exports.updateCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now ${status}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
