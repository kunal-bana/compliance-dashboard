const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

exports.register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email & password required", 400);
  }

  const exists = await User.findOne({ email });
  if (exists) throw new AppError("User exists", 400);

  const hashed = await bcrypt.hash(password, 10);

  const count = await User.countDocuments();
  const role = count === 0 ? "ADMIN" : "VIEWER";

  const user = await User.create({ email, password: hashed, role });

  res.json({ ...user.toObject(), id: user._id });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", 400);

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError("Wrong password", 400);

  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET missing", 500);
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: { ...user.toObject(), id: user._id },
  });
});