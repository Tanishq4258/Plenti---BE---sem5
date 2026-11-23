const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please add a food title'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['Bakery', 'Meals', 'Groceries', 'Desserts', 'Beverages', 'Other'],
      default: 'Meals'
    },
    originalPrice: {
      type: Number,
      required: [true, 'Please provide original price']
    },
    discountedPrice: {
      type: Number,
      required: [true, 'Please provide discounted rescue price']
    },
    discountPercentage: {
      type: Number
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide available quantity'],
      default: 1
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80'
    },
    pickupStart: {
      type: String,
      default: '18:00'
    },
    pickupEnd: {
      type: String,
      default: '21:30'
    },
    expiryDate: {
      type: Date
    },
    instructions: {
      type: String,
      default: 'Show your 4-digit pickup code upon counter collection.'
    },
    status: {
      type: String,
      enum: ['active', 'sold_out', 'expired', 'paused'],
      default: 'active'
    }
  },
  { timestamps: true }
);

// Auto calculate discount percentage
ListingSchema.pre('save', function (next) {
  if (this.originalPrice > 0 && this.discountedPrice >= 0) {
    this.discountPercentage = Math.round(
      ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100
    );
  }
  if (this.quantity <= 0) {
    this.status = 'sold_out';
  }
  next();
});

module.exports = mongoose.model('Listing', ListingSchema);
