const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    businessName: {
      type: String,
      required: [true, 'Please provide business name'],
      trim: true
    },
    category: {
      type: String,
      enum: ['Bakery', 'Restaurant', 'Cafe', 'Grocery', 'Desserts', 'Other'],
      default: 'Restaurant'
    },
    description: {
      type: String,
      default: 'Quality eatery offering freshly discounted surplus meals.'
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      default: 'Chandigarh'
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80'
    },
    operatingHours: {
      type: String,
      default: '09:00 AM - 10:00 PM'
    },
    pickupInstructions: {
      type: String,
      default: 'Head to the front counter and show your 4-digit Plenti pickup code.'
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'pending', 'rejected'],
      default: 'pending'
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active'
    },
    totalFoodRescuedKg: {
      type: Number,
      default: 0
    },
    totalOrdersCount: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 4.8
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Business', BusinessSchema);
