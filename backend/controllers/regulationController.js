const Regulation = require('../models/regulation');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const validators = require('../utils/validators');

/**
 * Get all regulations
 * @route GET /api/regulations
 * @returns {Array} Array of all regulations sorted by creation date
 */
exports.getAll = asyncHandler(async (req, res) => {
  try {
    const regulations = await Regulation.find().sort({ createdAt: -1 });

    if (!regulations || regulations.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No regulations found',
        data: [],
      });
    }

    const formatted = regulations.map((r) => ({
      ...r.toObject(),
      id: r._id,
    }));

    res.status(200).json({
      success: true,
      message: 'Regulations retrieved successfully',
      data: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error('Database error in getAll:', error);
    throw new AppError('Failed to retrieve regulations', 500);
  }
});

/**
 * Create a new regulation
 * @route POST /api/regulations
 * @param {string} title - Regulation title (required)
 * @param {string} code - Regulation code (required, must be unique)
 * @param {string} status - Regulation status (optional, defaults to Active)
 * @param {string} description - Regulation description (optional)
 * @param {Date} effectiveDate - Regulation effective date (optional)
 */
exports.create = asyncHandler(async (req, res) => {
  const { title, code, status, description, effectiveDate } = req.body;

  // Validate required fields
  validators.validateRequired({ title, code }, ['title', 'code']);

  // Validate field lengths
  if (title.trim().length < 3) {
    throw new AppError('Regulation title must be at least 3 characters', 400);
  }

  if (title.trim().length > 150) {
    throw new AppError('Regulation title cannot exceed 150 characters', 400);
  }

  // Validate code format
  if (!/^[A-Z0-9\-]+$/.test(code.toUpperCase())) {
    throw new AppError('Code must contain only uppercase letters, numbers, and hyphens', 400);
  }

  // Check if code already exists
  const existingCode = await Regulation.findOne({ code: code.toUpperCase() });
  if (existingCode) {
    throw new AppError(`Regulation with code '${code.toUpperCase()}' already exists`, 400);
  }

  // Validate status if provided
  if (status) {
    validators.validateEnum(status, ['Active', 'Inactive', 'Pending', 'Archived'], 'status');
  }

  // Validate effective date if provided
  if (effectiveDate && isNaN(new Date(effectiveDate).getTime())) {
    throw new AppError('Invalid effective date format', 400);
  }

  // Create regulation
  let regulation;
  try {
    regulation = await Regulation.create({
      title: title.trim(),
      code: code.toUpperCase(),
      status: status || 'Active',
      description: description ? description.trim() : undefined,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(`Regulation with code '${code.toUpperCase()}' already exists`, 400);
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map(e => e.message)
        .join(', ');
      throw new AppError(message, 400);
    }
    console.error('Regulation creation error:', error);
    throw new AppError('Failed to create regulation', 500);
  }

  res.status(201).json({
    success: true,
    message: 'Regulation created successfully',
    data: {
      ...regulation.toObject(),
      id: regulation._id,
    },
  });
});

/**
 * Update a regulation
 * @route PUT /api/regulations/:id
 * @param {string} id - Regulation ID (required, must be valid MongoDB ObjectId)
 */
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  validators.validateObjectId(id);

  // Validate input
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError('No update data provided', 400);
  }

  const { title, code, status, description, effectiveDate } = req.body;

  // Validate individual fields if provided
  if (title !== undefined) {
    if (title.trim().length < 3) {
      throw new AppError('Regulation title must be at least 3 characters', 400);
    }
    if (title.trim().length > 150) {
      throw new AppError('Regulation title cannot exceed 150 characters', 400);
    }
  }

  if (code !== undefined) {
    if (!/^[A-Z0-9\-]+$/.test(code.toUpperCase())) {
      throw new AppError('Code must contain only uppercase letters, numbers, and hyphens', 400);
    }
    // Check if new code is unique
    const existingCode = await Regulation.findOne({
      code: code.toUpperCase(),
      _id: { $ne: id },
    });
    if (existingCode) {
      throw new AppError(`Regulation with code '${code.toUpperCase()}' already exists`, 400);
    }
  }

  if (status !== undefined) {
    validators.validateEnum(status, ['Active', 'Inactive', 'Pending', 'Archived'], 'status');
  }

  if (description !== undefined && description.trim().length > 1000) {
    throw new AppError('Description cannot exceed 1000 characters', 400);
  }

  if (effectiveDate !== undefined && isNaN(new Date(effectiveDate).getTime())) {
    throw new AppError('Invalid effective date format', 400);
  }

  // Prepare update data
  const updateData = {};
  if (title !== undefined) updateData.title = title.trim();
  if (code !== undefined) updateData.code = code.toUpperCase();
  if (status !== undefined) updateData.status = status;
  if (description !== undefined) updateData.description = description.trim();
  if (effectiveDate !== undefined) updateData.effectiveDate = new Date(effectiveDate);

  // Update regulation
  let updated;
  try {
    updated = await Regulation.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(`Regulation code already exists`, 400);
    }
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map(e => e.message)
        .join(', ');
      throw new AppError(message, 400);
    }
    console.error('Regulation update error:', error);
    throw new AppError('Failed to update regulation', 500);
  }

  if (!updated) {
    throw new AppError('Regulation not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Regulation updated successfully',
    data: {
      ...updated.toObject(),
      id: updated._id,
    },
  });
});

/**
 * Delete a regulation
 * @route DELETE /api/regulations/:id
 * @param {string} id - Regulation ID (required, must be valid MongoDB ObjectId)
 */
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  validators.validateObjectId(id);

  // Delete regulation
  let deleted;
  try {
    deleted = await Regulation.findByIdAndDelete(id);
  } catch (error) {
    console.error('Regulation deletion error:', error);
    throw new AppError('Failed to delete regulation', 500);
  }

  if (!deleted) {
    throw new AppError('Regulation not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Regulation deleted successfully',
    data: {
      id: deleted._id,
    },
  });
});