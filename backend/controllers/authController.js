const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const validators = require('../utils/validators');

exports.register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  // Validate email format
  validators.validateEmail(email);

  // Validate password strength
  validators.validatePassword(password);

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Email already registered. Please login or use a different email', 400);
  }

  // Hash password with bcrypt (10 rounds)
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new AppError('Failed to process password', 500);
  }

  // Determine role - first user is ADMIN
  let role = 'VIEWER';
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      role = 'ADMIN';
    }
  } catch (error) {
    console.error('Error checking user count:', error);
    throw new AppError('Failed to create user', 500);
  }

  // Create new user
  let user;
  try {
    user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Email already registered', 400);
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map(e => e.message)
        .join(', ');
      throw new AppError(message, 400);
    }
    console.error('User creation error:', error);
    throw new AppError('Failed to create user', 500);
  }

  // Prepare response
  const userObject = user.toObject();
  delete userObject.password;

  res.status(201).json({
    success: true,
    message: `User registered successfully as ${role}`,
    data: {
      ...userObject,
      id: user._id,
    },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  validators.validateEmail(email);

  // Check if JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not configured');
    throw new AppError('Server configuration error', 500);
  }

  // Find user and include password field (normally excluded)
  let user;
  try {
    user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  } catch (error) {
    console.error('Database query error:', error);
    throw new AppError('Failed to retrieve user', 500);
  }

  if (!user) {
    // Don't reveal if email exists for security
    throw new AppError('Invalid email or password', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('Account has been deactivated. Contact administrator', 403);
  }

  // Verify password
  let passwordMatch;
  try {
    passwordMatch = await bcrypt.compare(password, user.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    throw new AppError('Authentication failed', 500);
  }

  if (!passwordMatch) {
    // Don't reveal if password is wrong for security
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  let token;
  try {
    token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  } catch (error) {
    console.error('Token generation error:', error);
    throw new AppError('Failed to generate authentication token', 500);
  }

  // Prepare user response
  const userObject = user.toObject();
  delete userObject.password;

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        ...userObject,
        id: user._id,
      },
    },
  });
});