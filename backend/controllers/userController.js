const User = require("../models/User");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// GET USERS
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");

  const formatted = users.map((u) => ({
    ...u.toObject(),
    id: u._id,
  }));

  res.json(formatted);
});

// CREATE USER
exports.createUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    throw new AppError("All fields required", 400);
  }

  const allowedRoles = ["ADMIN", "MANAGER", "VIEWER"];
  if (!allowedRoles.includes(role)) {
    throw new AppError("Invalid role", 400);
  }

  const exists = await User.findOne({ email });
  if (exists) {
    throw new AppError("User already exists", 400);
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashed,
    role,
  });

  res.status(201).json({
    ...user.toObject(),
    id: user._id,
  });
});

// UPDATE ROLE
exports.updateUserRole = asyncHandler(async (req, res) => {
  const allowedRoles = ["ADMIN", "MANAGER", "VIEWER"];

  if (!allowedRoles.includes(req.body.role)) {
    throw new AppError("Invalid role", 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: req.body.role },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ ...user.toObject(), id: user._id });
});

// DELETE USER
exports.deleteUser = asyncHandler(async (req, res) => {
  if (req.user.id === req.params.id) {
    throw new AppError("Cannot delete yourself", 400);
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await User.findByIdAndDelete(req.params.id);

  res.json({ success: true });
});

// PROFILE
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ ...user.toObject(), id: user._id });
});

// CHANGE PASSWORD
exports.changePassword = asyncHandler(async (req, res) => {
  if (!req.body.newPassword) {
    throw new AppError("New password required", 400);
  }

  const hashed = await bcrypt.hash(req.body.newPassword, 10);

  await User.findByIdAndUpdate(req.user.id, { password: hashed });

  res.json({ success: true });
});