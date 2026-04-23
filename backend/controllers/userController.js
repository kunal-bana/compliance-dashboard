const User = require('../models/user');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const validators = require('../utils/validators');

exports.getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    if (!users || users.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No users found',
        data: [],
      });
    }

    const formatted = users.map((u) => ({
      ...u.toObject(),
      id: u._id,
    }));

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error('Database error in getUsers:', error);
    throw new AppError('Failed to retrieve users', 500);
  }
});

exports.createUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  // Validate required fields
  validators.validateRequired({ email, password, role }, ['email', 'password', 'role']);

  // Validate email format
  validators.validateEmail(email);

  // Validate password strength
  validators.validatePassword(password);

  // Validate role
  const allowedRoles = ['ADMIN', 'MANAGER', 'VIEWER'];
  validators.validateEnum(role, allowedRoles, 'role');

  // Check if user already exists
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email.toLowerCase() });
  } catch (error) {
    console.error('Database query error:', error);
    throw new AppError('Failed to verify email availability', 500);
  }

  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Hash password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new AppError('Failed to process password', 500);
  }

  // Create user
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

  const userObject = user.toObject();
  delete userObject.password;

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      ...userObject,
      id: user._id,
    },
  });
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  // Validate ID
  validators.validateObjectId(id);

  // Validate role
  if (!role) {
    throw new AppError('New role is required', 400);
  }

  const allowedRoles = ['ADMIN', 'MANAGER', 'VIEWER'];
  validators.validateEnum(role, allowedRoles, 'role');

  // Check if user exists
  let user;
  try {
    user = await User.findById(id);
  } catch (error) {
    console.error('User lookup error:', error);
    throw new AppError('Failed to retrieve user', 500);
  }

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent changing own role to prevent lockout
  if (req.user.id === id && req.user.role === 'ADMIN' && role !== 'ADMIN') {
    throw new AppError('Cannot change your own role from ADMIN. Please ask another ADMIN to change your role.', 400);
  }

  // Update role
  let updated;
  try {
    updated = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map(e => e.message)
        .join(', ');
      throw new AppError(message, 400);
    }
    console.error('Role update error:', error);
    throw new AppError('Failed to update user role', 500);
  }

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: {
      ...updated.toObject(),
      id: updated._id,
    },
  });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  validators.validateObjectId(id);

  // Prevent self-deletion
  if (req.user.id === id) {
    throw new AppError('Cannot delete your own account. Please ask another administrator.', 400);
  }

  // Check if user exists
  let user;
  try {
    user = await User.findById(id);
  } catch (error) {
    console.error('User lookup error:', error);
    throw new AppError('Failed to retrieve user', 500);
  }

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent deleting the last ADMIN
  if (user.role === 'ADMIN') {
    let adminCount;
    try {
      adminCount = await User.countDocuments({ role: 'ADMIN' });
    } catch (error) {
      console.error('Admin count error:', error);
      throw new AppError('Failed to verify admin count', 500);
    }

    if (adminCount === 1) {
      throw new AppError('Cannot delete the last ADMIN user. Promote another user to ADMIN first.', 400);
    }
  }

  // Delete user
  let deleted;
  try {
    deleted = await User.findByIdAndDelete(id);
  } catch (error) {
    console.error('User deletion error:', error);
    throw new AppError('Failed to delete user', 500);
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
    data: {
      id: deleted._id,
    },
  });
});

exports.getProfile = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    throw new AppError('User not authenticated', 401);
  }

  let user;
  try {
    user = await User.findById(req.user.id).select('-password');
  } catch (error) {
    console.error('User lookup error:', error);
    throw new AppError('Failed to retrieve user profile', 500);
  }

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.isActive) {
    throw new AppError('Account has been deactivated', 403);
  }

  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      ...user.toObject(),
      id: user._id,
    },
  });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword) {
    throw new AppError('New password is required', 400);
  }

  // Validate new password strength
  validators.validatePassword(newPassword);

  // Prevent setting same password
  if (currentPassword === newPassword) {
    throw new AppError('New password must be different from current password', 400);
  }

  if (!req.user || !req.user.id) {
    throw new AppError('User not authenticated', 401);
  }

  // Get user with password field
  let user;
  try {
    user = await User.findById(req.user.id).select('+password');
  } catch (error) {
    console.error('User lookup error:', error);
    throw new AppError('Failed to retrieve user', 500);
  }

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If currentPassword is provided, verify it
  if (currentPassword) {
    let passwordMatch;
    try {
      passwordMatch = await bcrypt.compare(currentPassword, user.password);
    } catch (error) {
      console.error('Password comparison error:', error);
      throw new AppError('Failed to verify current password', 500);
    }

    if (!passwordMatch) {
      throw new AppError('Current password is incorrect', 401);
    }
  }

  // Hash new password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(newPassword, 10);
  } catch (error) {
    console.error('Password hashing error:', error);
    throw new AppError('Failed to process new password', 500);
  }

  // Update password
  try {
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
  } catch (error) {
    console.error('Password update error:', error);
    throw new AppError('Failed to update password', 500);
  }

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});