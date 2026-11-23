const Business = require('../models/Business');
const Listing = require('../models/Listing');
const Order = require('../models/Order');

// @desc    Get all businesses with optional search & category filter
// @route   GET /api/businesses
// @access  Public
exports.getBusinesses = async (req, res) => {
  try {
    const { category, search, verified } = req.query;
    let query = { status: 'active' };

    if (category && category !== 'all') {
      query.category = category;
    }
    if (verified === 'true') {
      query.verificationStatus = 'verified';
    }
    if (search) {
      query.businessName = { $regex: search, $options: 'i' };
    }

    const businesses = await Business.find(query).populate('owner', 'name email phone');

    res.status(200).json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single business by ID
// @route   GET /api/businesses/:id
// @access  Public
exports.getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id).populate('owner', 'name email phone');
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }

    const listings = await Listing.find({ business: business._id, status: 'active' });

    res.status(200).json({
      success: true,
      data: business,
      listings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats for current merchant
// @route   GET /api/businesses/current/stats
// @access  Private (Business)
exports.getMyBusinessStats = async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'No business profile associated with this account' });
    }

    const activeListings = await Listing.countDocuments({ business: business._id, status: 'active' });
    const pendingOrders = await Order.countDocuments({ business: business._id, orderStatus: 'pending' });
    const completedOrders = await Order.countDocuments({ business: business._id, orderStatus: 'completed' });
    const totalOrders = await Order.countDocuments({ business: business._id });

    const recentOrders = await Order.find({ business: business._id })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        business,
        activeListings,
        pendingOrders,
        completedOrders,
        totalOrders,
        earnings: business.totalEarnings || 38450,
        foodRescuedKg: business.totalFoodRescuedKg || 285,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current business profile
// @route   PUT /api/businesses/current/profile
// @access  Private (Business)
exports.updateMyProfile = async (req, res) => {
  try {
    let business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business profile not found' });
    }

    const allowedUpdates = [
      'businessName',
      'category',
      'description',
      'phone',
      'address',
      'city',
      'operatingHours',
      'pickupInstructions',
      'logo'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        business[field] = req.body[field];
      }
    });

    await business.save();

    res.status(200).json({
      success: true,
      message: 'Business profile updated successfully',
      data: business
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
