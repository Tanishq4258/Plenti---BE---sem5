const User = require('../models/User');
const Business = require('../models/Business');
const jwt = require('jsonwebtoken');

// Helper to sign JWT token
const sendTokenResponse = (user, statusCode, res, business = null) => {
  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'plenti_super_secure_jwt_secret_key_2026_xyz987',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      city: user.city,
      status: user.status
    },
    business: business
  });
};

// @desc    Register a new user (Customer or Food Business)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address, businessName, category } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const assignedRole = ['customer', 'business', 'admin'].includes(role) ? role : 'customer';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      phone: phone || '',
      address: address || ''
    });

    let businessProfile = null;
    if (assignedRole === 'business') {
      businessProfile = await Business.create({
        owner: user._id,
        businessName: businessName || `${name}'s Kitchen`,
        category: category || 'Restaurant',
        email: email.toLowerCase(),
        phone: phone || '',
        address: address || 'Main High Street',
        verificationStatus: 'pending'
      });
    }

    sendTokenResponse(user, 201, res, businessProfile);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Check user exists with password field explicitly selected
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No user found with this email.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform administrators.'
      });
    }

    let business = null;
    if (user.role === 'business') {
      business = await Business.findOne({ owner: user._id });
    }

    sendTokenResponse(user, 200, res, business);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { email, name, role } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account email is required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: Math.random().toString(36).slice(-10) + 'A1!',
        role: ['customer', 'business'].includes(role) ? role : 'customer'
      });

      if (user.role === 'business') {
        await Business.create({
          owner: user._id,
          businessName: `${user.name}'s Kitchen`,
          category: 'Restaurant',
          email: user.email,
          verificationStatus: 'pending'
        });
      }
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact platform administrators.' });
    }

    let business = null;
    if (user.role === 'business') {
      business = await Business.findOne({ owner: user._id });
    }

    sendTokenResponse(user, 200, res, business);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get currently logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let business = null;

    if (user.role === 'business') {
      business = await Business.findOne({ owner: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      business
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
