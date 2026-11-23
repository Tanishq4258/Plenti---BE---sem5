const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Business = require('../models/Business');
const Listing = require('../models/Listing');
const Order = require('../models/Order');

const seedDatabase = async () => {
  try {
    const connStr = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/plenti_db';
    console.log(`Connecting to MongoDB at: ${connStr}...`);
    await mongoose.connect(connStr);
    console.log('✅ Connected to MongoDB.');

    console.log('Cleaning existing collections...');
    await User.deleteMany();
    await Business.deleteMany();
    await Listing.deleteMany();
    await Order.deleteMany();

    console.log('Creating Admin User...');
    const adminUser = await User.create({
      name: 'Plenti Admin',
      email: 'admin@plenti.com',
      password: 'password123',
      role: 'admin',
      phone: '+91 98765 00000',
      address: 'Plenti HQ, Sector 17',
      city: 'Chandigarh'
    });

    console.log('Creating Food Business Users & Store Profiles...');
    const bakeryOwner = await User.create({
      name: 'Chef Pierre',
      email: 'pierre@artisanbakery.com',
      password: 'password123',
      role: 'business',
      phone: '+91 98765 11111',
      address: 'Shop 12, Heritage Market',
      city: 'Chandigarh'
    });

    const bakery = await Business.create({
      owner: bakeryOwner._id,
      businessName: 'The Artisan Bakery & Patisserie',
      category: 'Bakery',
      email: 'contact@artisanbakery.com',
      phone: '+91 98765 11111',
      address: 'Shop 12, Heritage Market, Sector 8',
      city: 'Chandigarh',
      description: 'Artisanal sourdoughs, flaky croissants, and fresh daily pastries baked with French tradition.',
      logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
      operatingHours: '08:00 AM - 09:30 PM',
      pickupInstructions: 'Pick up at the bakery express takeaway counter. Show pickup code.',
      verificationStatus: 'verified',
      totalFoodRescuedKg: 285,
      totalOrdersCount: 142,
      totalEarnings: 38450,
      rating: 4.9
    });

    const cafeOwner = await User.create({
      name: 'Ananya Sharma',
      email: 'ananya@greenleafcafe.com',
      password: 'password123',
      role: 'business',
      phone: '+91 98765 22222',
      address: 'Booth 45, Inner Market',
      city: 'Chandigarh'
    });

    const cafe = await Business.create({
      owner: cafeOwner._id,
      businessName: 'Green Leaf Organic Cafe',
      category: 'Cafe',
      email: 'orders@greenleafcafe.com',
      phone: '+91 98765 22222',
      address: 'Booth 45, Inner Market, Sector 35',
      city: 'Chandigarh',
      description: 'Healthy wholesome salads, artisan sourdough sandwiches, and nutrient bowls made from locally sourced organic farms.',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
      operatingHours: '09:00 AM - 10:00 PM',
      pickupInstructions: 'Present pickup code at juice bar counter.',
      verificationStatus: 'verified',
      totalFoodRescuedKg: 198,
      totalOrdersCount: 96,
      totalEarnings: 27800,
      rating: 4.8
    });

    const restaurantOwner = await User.create({
      name: 'Vikram Malhotra',
      email: 'vikram@spicebox.com',
      password: 'password123',
      role: 'business',
      phone: '+91 98765 33333',
      address: 'SCO 21, Madhya Marg',
      city: 'Chandigarh'
    });

    const restaurant = await Business.create({
      owner: restaurantOwner._id,
      businessName: 'Royal Spice Kitchen',
      category: 'Restaurant',
      email: 'service@royalspice.com',
      phone: '+91 98765 33333',
      address: 'SCO 21, Madhya Marg, Sector 26',
      city: 'Chandigarh',
      description: 'Rich North Indian curries, aromatic biryanis, and tandoori specials cooked fresh daily.',
      logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
      operatingHours: '12:00 PM - 11:00 PM',
      pickupInstructions: 'Show code at the front reception billing desk.',
      verificationStatus: 'verified',
      totalFoodRescuedKg: 340,
      totalOrdersCount: 168,
      totalEarnings: 49500,
      rating: 4.7
    });

    console.log('Creating Customer Users...');
    const customer1 = await User.create({
      name: 'Rohan Mehra',
      email: 'rohan@example.com',
      password: 'password123',
      role: 'customer',
      phone: '+91 99887 11223',
      address: 'Flat 402, Green Valley Apartments',
      city: 'Chandigarh',
      foodRescuedKg: 24,
      moneySaved: 3200
    });

    const customer2 = await User.create({
      name: 'Simran Kaur',
      email: 'simran@example.com',
      password: 'password123',
      role: 'customer',
      phone: '+91 99887 44556',
      address: 'House 812, Sector 22',
      city: 'Chandigarh',
      foodRescuedKg: 18,
      moneySaved: 2450
    });

    console.log('Creating Surplus Food Listings...');
    const listings = await Listing.insertMany([
      {
        business: bakery._id,
        title: 'Assorted Viennoiserie & Sourdough Box',
        description: 'Fresh butter croissants, chocolate pain au chocolat, cinnamon danishes, and rustic sourdough slices from today morning bake.',
        category: 'Bakery',
        originalPrice: 420,
        discountedPrice: 149,
        discountPercentage: 65,
        quantity: 5,
        image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80',
        pickupStart: '18:00',
        pickupEnd: '21:30',
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'active',
        instructions: 'Contains gluten and dairy. Best enjoyed lightly toasted.'
      },
      {
        business: bakery._id,
        title: 'Artisan Baguettes & Focaccia Pack',
        description: 'Crispy rosemary sea salt focaccia squares and two rustic country baguettes. Perfect for dinner sandwiches.',
        category: 'Bakery',
        originalPrice: 280,
        discountedPrice: 99,
        discountPercentage: 65,
        quantity: 4,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
        pickupStart: '18:30',
        pickupEnd: '21:30',
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'active',
        instructions: 'Bring your own bread bag if possible.'
      },
      {
        business: cafe._id,
        title: 'Superfood Quinoa & Roasted Veggie Bowl',
        description: 'Roasted butternut squash, organic quinoa, baby spinach, avocado, spiced chickpeas, and creamy tahini dressing.',
        category: 'Meals',
        originalPrice: 350,
        discountedPrice: 139,
        discountPercentage: 60,
        quantity: 3,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
        pickupStart: '19:00',
        pickupEnd: '21:45',
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'active',
        instructions: '100% Vegan & Gluten Free.'
      },
      {
        business: cafe._id,
        title: 'Cold Brew & Artisan Muffin Combo',
        description: 'Single-origin 16-hour cold brew coffee paired with two fresh blueberry streusel muffins.',
        category: 'Beverages',
        originalPrice: 260,
        discountedPrice: 110,
        discountPercentage: 58,
        quantity: 6,
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&q=80',
        pickupStart: '17:00',
        pickupEnd: '20:30',
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'active',
        instructions: 'Served chilled in paper cup.'
      },
      {
        business: restaurant._id,
        title: 'Paneer Butter Masala & Garlic Naan Feast',
        description: 'Slow-cooked rich cottage cheese curry in velvet makhani gravy served with two warm butter garlic naans and salad.',
        category: 'Meals',
        originalPrice: 480,
        discountedPrice: 179,
        discountPercentage: 63,
        quantity: 4,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80',
        pickupStart: '20:00',
        pickupEnd: '22:30',
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'active',
        instructions: 'Packed in food-grade recyclable containers.'
      },
      {
        business: restaurant._id,
        title: 'Awadhi Dum Biryani Surplus Pot',
        description: 'Fragrant basmati rice layered with garden vegetables, saffron milk, caramelized onions, and cooling mint raita.',
        category: 'Meals',
        originalPrice: 380,
        discountedPrice: 149,
        discountPercentage: 61,
        quantity: 5,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
        pickupStart: '20:15',
        pickupEnd: '22:30',
        expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'active',
        instructions: 'Served hot with raita and salan.'
      }
    ]);

    console.log('Creating Orders...');
    await Order.create([
      {
        orderId: 'PL-8041',
        customer: customer1._id,
        business: bakery._id,
        items: [
          {
            listing: listings[0]._id,
            title: listings[0].title,
            quantity: 1,
            price: 149
          }
        ],
        totalAmount: 149,
        paymentStatus: 'paid',
        orderStatus: 'ready',
        pickupCode: '4821',
        pickupWindow: 'Today, 6:00 PM - 9:30 PM'
      },
      {
        orderId: 'PL-8042',
        customer: customer2._id,
        business: bakery._id,
        items: [
          {
            listing: listings[1]._id,
            title: listings[1].title,
            quantity: 2,
            price: 99
          }
        ],
        totalAmount: 198,
        paymentStatus: 'paid',
        orderStatus: 'pending',
        pickupCode: '7294',
        pickupWindow: 'Today, 6:30 PM - 9:30 PM'
      },
      {
        orderId: 'PL-8043',
        customer: customer1._id,
        business: restaurant._id,
        items: [
          {
            listing: listings[4]._id,
            title: listings[4].title,
            quantity: 1,
            price: 179
          }
        ],
        totalAmount: 179,
        paymentStatus: 'paid',
        orderStatus: 'completed',
        pickupCode: '1105',
        pickupWindow: 'Yesterday, 8:00 PM - 10:30 PM'
      }
    ]);

    console.log('========================================================');
    console.log('🎉 MongoDB Seed Completed Successfully!');
    console.log('========================================================');
    console.log('Demo Credentials Seeded:');
    console.log('1. Admin:    email: admin@plenti.com         password: password123');
    console.log('2. Merchant: email: pierre@artisanbakery.com  password: password123');
    console.log('3. Merchant: email: ananya@greenleafcafe.com  password: password123');
    console.log('4. Customer: email: rohan@example.com         password: password123');
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
