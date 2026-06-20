const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/mongodb/User');
const { protect } = require('../middleware/auth');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, { expiresIn: jwtExpiresIn });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (should restrict to Admin in production, but open for initial setup)
router.post('/register', async (req, res, next) => {
  const { username, password, name, role, email, vendorCode } = req.body;

  try {
    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({
      username,
      password,
      name,
      role,
      email,
      vendorCode
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Please provide username and password' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        vendorCode: user.vendorCode
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

module.exports = router;
