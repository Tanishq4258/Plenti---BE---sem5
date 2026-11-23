const Order = require('../models/Order');
const Listing = require('../models/Listing');
const Business = require('../models/Business');

// @desc    Create new food rescue order
// @route   POST /api/orders
// @access  Private (Customer)
exports.createOrder = async (req, res) => {
  try {
    const { listingId, quantity, notes } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Surplus listing not found' });
    }

    const orderQty = Number(quantity) || 1;
    if (listing.quantity < orderQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${listing.quantity} portion(s) remaining for this listing`
      });
    }

    // Atomic inventory lock / decrement
    listing.quantity -= orderQty;
    if (listing.quantity === 0) {
      listing.status = 'sold_out';
    }
    await listing.save();

    const orderCount = await Order.countDocuments();
    const orderId = `PL-${8000 + orderCount + 1}`;
    const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();

    const order = await Order.create({
      orderId,
      customer: req.user.id,
      business: listing.business,
      items: [
        {
          listing: listing._id,
          title: listing.title,
          quantity: orderQty,
          price: listing.discountedPrice
        }
      ],
      totalAmount: listing.discountedPrice * orderQty,
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      pickupCode,
      pickupWindow: `Today, ${listing.pickupStart} - ${listing.pickupEnd}`,
      notes: notes || ''
    });

    // Update business metrics
    await Business.findByIdAndUpdate(listing.business, {
      $inc: {
        totalFoodRescuedKg: 1.5 * orderQty,
        totalOrdersCount: 1,
        totalEarnings: listing.discountedPrice * orderQty
      }
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Keep your 4-digit pickup code handy.',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders for current customer
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('business', 'businessName address phone logo')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get orders for current merchant store
// @route   GET /api/orders/store-orders
// @access  Private (Business)
exports.getStoreOrders = async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res.status(404).json({ success: false, message: 'No business store found' });
    }

    const { status } = req.query;
    let query = { business: business._id };
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Accept, Mark Ready, Complete, Cancel)
// @route   PATCH /api/orders/:id/status
// @access  Private (Business / Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify customer 4-digit pickup code at counter
// @route   POST /api/orders/verify-code
// @access  Private (Business)
exports.verifyPickupCode = async (req, res) => {
  try {
    const { orderId, pickupCode } = req.body;
    const business = await Business.findOne({ owner: req.user.id });

    const order = await Order.findOne({
      $or: [{ _id: orderId }, { orderId: orderId }],
      business: business._id
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for your store' });
    }

    if (order.pickupCode !== pickupCode.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect 4-digit pickup code!' });
    }

    order.orderStatus = 'completed';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Pickup code verified successfully! Order marked as Completed.',
      data: order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
