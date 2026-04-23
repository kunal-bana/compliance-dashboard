const Entity = require('../models/entity');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const validators = require('../utils/validators');

/**
 * Get all entities
 * @route GET /api/entities
 * @returns {Array} Array of all entities sorted by creation date
 */
exports.getAll = asyncHandler(async (req, res) => {
  try {
    const entities = await Entity.find().sort({ createdAt: -1 });

    if (!entities || entities.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No entities found',
        data: [],
      });
    }

    const formatted = entities.map((e) => ({
      ...e.toObject(),
      id: e._id,
    }));

    res.status(200).json({
      success: true,
      message: 'Entities retrieved successfully',
      data: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error('Database error in getAll:', error);
    throw new AppError('Failed to retrieve entities', 500);
  }
});

/**
 * Create a new entity
 * @route POST /api/entities
 * @param {string} name - Entity name (required)
 * @param {string} type - Entity type (required)
 * @param {string} status - Entity status (optional, defaults to Active)
 * @param {string} description - Entity description (optional)
 */
exports.create = asyncHandler(async (req, res) => {
  const { name, type, status, description } = req.body;

  // Validate required fields
  validators.validateRequired({ name, type }, ['name', 'type']);

  // Validate field lengths
  if (name && name.trim().length < 2) {
    throw new AppError('Entity name must be at least 2 characters', 400);
  }

  if (name && name.trim().length > 100) {
    throw new AppError('Entity name cannot exceed 100 characters', 400);
  }

  if (type && type.trim().length < 2) {
    throw new AppError('Entity type must be at least 2 characters', 400);
  }

  // Validate status if provided
  if (status) {
    validators.validateEnum(status, ['Active', 'Inactive', 'Pending', 'Suspended'], 'status');
  }

  // Create entity
  let entity;
  try {
    entity = await Entity.create({
      name: name.trim(),
      type: type.trim(),
      status: status || 'Active',
      description: description ? description.trim() : undefined,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map(e => e.message)
        .join(', ');
      throw new AppError(message, 400);
    }
    console.error('Entity creation error:', error);
    throw new AppError('Failed to create entity', 500);
  }

  res.status(201).json({
    success: true,
    message: 'Entity created successfully',
    data: {
      ...entity.toObject(),
      id: entity._id,
    },
  });
});

/**
 * Update an entity
 * @route PUT /api/entities/:id
 * @param {string} id - Entity ID (required, must be valid MongoDB ObjectId)
 */
exports.updateEntity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  validators.validateObjectId(id);

  // Validate input
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError('No update data provided', 400);
  }

  const { name, type, status, description } = req.body;

  // Validate individual fields if provided
  if (name !== undefined) {
    if (name.trim().length < 2) {
      throw new AppError('Entity name must be at least 2 characters', 400);
    }
    if (name.trim().length > 100) {
      throw new AppError('Entity name cannot exceed 100 characters', 400);
    }
  }

  if (type !== undefined && type.trim().length < 2) {
    throw new AppError('Entity type must be at least 2 characters', 400);
  }

  if (status !== undefined) {
    validators.validateEnum(status, ['Active', 'Inactive', 'Pending', 'Suspended'], 'status');
  }

  if (description !== undefined && description.trim().length > 500) {
    throw new AppError('Description cannot exceed 500 characters', 400);
  }

  // Prepare update data
  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (type !== undefined) updateData.type = type.trim();
  if (status !== undefined) updateData.status = status;
  if (description !== undefined) updateData.description = description.trim();

  // Update entity
  let updated;
  try {
    updated = await Entity.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map(e => e.message)
        .join(', ');
      throw new AppError(message, 400);
    }
    console.error('Entity update error:', error);
    throw new AppError('Failed to update entity', 500);
  }

  if (!updated) {
    throw new AppError('Entity not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Entity updated successfully',
    data: {
      ...updated.toObject(),
      id: updated._id,
    },
  });
});

/**
 * Delete an entity
 * @route DELETE /api/entities/:id
 * @param {string} id - Entity ID (required, must be valid MongoDB ObjectId)
 */
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  validators.validateObjectId(id);

  // Delete entity
  let deleted;
  try {
    deleted = await Entity.findByIdAndDelete(id);
  } catch (error) {
    console.error('Entity deletion error:', error);
    throw new AppError('Failed to delete entity', 500);
  }

  if (!deleted) {
    throw new AppError('Entity not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Entity deleted successfully',
    data: {
      id: deleted._id,
    },
  });
});