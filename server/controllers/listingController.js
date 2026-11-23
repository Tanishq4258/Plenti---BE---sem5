const Listing = require('../models/Listing');
const Business = require('../models/Business');

// @desc    Get all active surplus listings with filter & search
// @route   GET /api/listings
// @access  Public
exports.getListings = async (req, res) => {
  try {
    const { category, search, status, businessId } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      query.status = 'active';
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (businessId) {
      query.business = businessId;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const listings = await Listing.find(query)
      .populate('business', 'businessName category address city logo verificationStatus')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single listing by ID
// @route   GET /api/listings/:id
// @access  Public
exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('business');
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new surplus food listing
// @route   POST /api/listings
// @access  Private (Business only)
exports.createListing = async (req, res) => {
  try {
    let business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res.status(403).json({
        success: false,
        message: 'Must have a verified food business profile to publish listings'
      });
    }

    const {
      title,
      description,
      category,
      originalPrice,
      discountedPrice,
      quantity,
      image,
      pickupStart,
      pickupEnd,
      expiryDate,
      instructions
    } = req.body;

    const discountPercentage =
      originalPrice > 0
        ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
        : 0;

    const listing = await Listing.create({
      business: business._id,
      title,
      description: description || 'Fresh surplus food bundle prepared today.',
      category: category || 'Meals',
      originalPrice: Number(originalPrice),
      discountedPrice: Number(discountedPrice),
      discountPercentage,
      quantity: Number(quantity) || 1,
      image: image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
      pickupStart: pickupStart || '18:00',
      pickupEnd: pickupEnd || '21:30',
      expiryDate: expiryDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
      instructions: instructions || 'Show your 4-digit pickup code upon counter collection.',
      status: Number(quantity) > 0 ? 'active' : 'sold_out'
    });

    res.status(201).json({
      success: true,
      message: 'Surplus food listing published successfully',
      data: listing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update an existing listing
// @route   PUT /api/listings/:id
// @access  Private (Business owner)
exports.updateListing = async (req, res) => {
  try {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    // Check ownership
    const business = await Business.findOne({ owner: req.user.id });
    if (
      req.user.role !== 'admin' &&
      (!business || listing.business.toString() !== business._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this listing' });
    }

    const fields = [
      'title',
      'description',
      'category',
      'originalPrice',
      'discountedPrice',
      'quantity',
      'image',
      'pickupStart',
      'pickupEnd',
      'expiryDate',
      'instructions',
      'status'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    if (req.body.originalPrice && req.body.discountedPrice) {
      listing.discountPercentage = Math.round(
        ((listing.originalPrice - listing.discountedPrice) / listing.originalPrice) * 100
      );
    }

    if (listing.quantity <= 0) {
      listing.status = 'sold_out';
    }

    await listing.save();

    res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      data: listing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete/Delist listing
// @route   DELETE /api/listings/:id
// @access  Private (Business owner or Admin)
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    const business = await Business.findOne({ owner: req.user.id });
    if (
      req.user.role !== 'admin' &&
      (!business || listing.business.toString() !== business._id.toString())
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Live stock increment/decrement
// @route   PATCH /api/listings/:id/stock
// @access  Private (Business owner)
exports.updateStock = async (req, res) => {
  try {
    const { delta, quantity } = req.body;
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (quantity !== undefined) {
      listing.quantity = Math.max(0, Number(quantity));
    } else if (delta !== undefined) {
      listing.quantity = Math.max(0, listing.quantity + Number(delta));
    }

    listing.status = listing.quantity > 0 ? 'active' : 'sold_out';
    await listing.save();

    res.status(200).json({
      success: true,
      message: `Stock updated to ${listing.quantity}`,
      data: listing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
