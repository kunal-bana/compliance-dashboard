const Task = require('../models/task');
const User = require('../models/user');
const Entity = require('../models/entity');
const Regulation = require('../models/regulation');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const validators = require('../utils/validators');

/**
 * Get all tasks
 * @route GET /api/tasks
 * @returns {Array} Array of all tasks sorted by creation date
 */
exports.getAll = asyncHandler(async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'email role')
      .populate('createdBy', 'email role')
      .populate('entityId', 'name type')
      .populate('regulationId', 'title code')
      .sort({ createdAt: -1 });

    if (!tasks || tasks.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No tasks found',
        data: [],
      });
    }

    const formatted = tasks.map((t) => ({
      ...t.toObject(),
      id: t._id,
    }));

    res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error('Database error in getAll:', error);
    throw new AppError('Failed to retrieve tasks', 500);
  }
});

/**
 * Create a new task
 * @route POST /api/tasks
 * @param {string} title - Task title (required)
 * @param {string} description - Task description (optional)
 * @param {string} entityId - Entity ID (required, must be valid ObjectId)
 * @param {string} regulationId - Regulation ID (required, must be valid ObjectId)
 * @param {string} assignedTo - User ID to assign task (required, must be valid ObjectId)
 * @param {string} status - Task status (optional, defaults to Pending)
 * @param {string} priority - Task priority (optional, defaults to Medium)
 * @param {Date} dueDate - Task due date (required)
 * @param {string} notes - Task notes (optional)
 */
exports.create = asyncHandler(async (req, res) => {
  const { title, description, entityId, regulationId, assignedTo, status, priority, dueDate, notes } = req.body;

  // Validate required fields
  validators.validateRequired({ title, entityId, regulationId, assignedTo, dueDate }, 
    ['title', 'entityId', 'regulationId', 'assignedTo', 'dueDate']);

  // Validate title
  if (title.trim().length < 3) {
    throw new AppError('Task title must be at least 3 characters', 400);
  }

  if (title.trim().length > 100) {
    throw new AppError('Task title cannot exceed 100 characters', 400);
  }

  // Validate ObjectIds
  validators.validateObjectId(entityId, 'entityId');
  validators.validateObjectId(regulationId, 'regulationId');
  validators.validateObjectId(assignedTo, 'assignedTo');

  // Validate dueDate
  const dueDateObj = new Date(dueDate);
  if (isNaN(dueDateObj.getTime())) {
    throw new AppError('Invalid due date format', 400);
  }

  if (dueDateObj < new Date()) {
    throw new AppError('Due date cannot be in the past', 400);
  }

  // Validate status if provided
  if (status) {
    validators.validateEnum(status, ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'], 'status');
  }

  // Validate priority if provided
  if (priority) {
    validators.validateEnum(priority, ['Low', 'Medium', 'High', 'Critical'], 'priority');
  }

  // Check if Entity exists
  let entity;
  try {
    entity = await Entity.findById(entityId);
  } catch (error) {
    console.error('Entity lookup error:', error);
    throw new AppError('Failed to verify entity', 500);
  }

  if (!entity) {
    throw new AppError('Entity not found', 404);
  }

  // Check if Regulation exists
  let regulation;
  try {
    regulation = await Regulation.findById(regulationId);
  } catch (error) {
    console.error('Regulation lookup error:', error);
    throw new AppError('Failed to verify regulation', 500);
  }

  if (!regulation) {
    throw new AppError('Regulation not found', 404);
  }

  // Check if assigned user exists
  let assignedUser;
  try {
    assignedUser = await User.findById(assignedTo);
  } catch (error) {
    console.error('User lookup error:', error);
    throw new AppError('Failed to verify assigned user', 500);
  }

  if (!assignedUser) {
    throw new AppError('Assigned user not found', 404);
  }

  // Create task
  let task;
  try {
    task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : undefined,
      entityId,
      regulationId,
      assignedTo,
      status: status || 'Pending',
      priority: priority || 'Medium',
      dueDate: dueDateObj,
      createdBy: req.user.id,
      notes: notes ? notes.trim() : undefined,
    });

    // Populate references
    await task.populate('assignedTo', 'email role');
    await task.populate('createdBy', 'email role');
    await task.populate('entityId', 'name type');
    await task.populate('regulationId', 'title code');
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map(e => e.message)
        .join(', ');
      throw new AppError(message, 400);
    }
    console.error('Task creation error:', error);
    throw new AppError('Failed to create task', 500);
  }

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: {
      ...task.toObject(),
      id: task._id,
    },
  });
});

/**
 * Update a task
 * @route PUT /api/tasks/:id
 * @param {string} id - Task ID (required, must be valid MongoDB ObjectId)
 */
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  validators.validateObjectId(id);

  // Validate input
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError('No update data provided', 400);
  }

  const { title, description, entityId, regulationId, assignedTo, status, priority, dueDate, notes, completedAt } = req.body;

  // Validate individual fields if provided
  if (title !== undefined) {
    if (title.trim().length < 3) {
      throw new AppError('Task title must be at least 3 characters', 400);
    }
    if (title.trim().length > 100) {
      throw new AppError('Task title cannot exceed 100 characters', 400);
    }
  }

  if (entityId !== undefined) {
    validators.validateObjectId(entityId, 'entityId');
    const entity = await Entity.findById(entityId);
    if (!entity) {
      throw new AppError('Entity not found', 404);
    }
  }

  if (regulationId !== undefined) {
    validators.validateObjectId(regulationId, 'regulationId');
    const regulation = await Regulation.findById(regulationId);
    if (!regulation) {
      throw new AppError('Regulation not found', 404);
    }
  }

  if (assignedTo !== undefined) {
    validators.validateObjectId(assignedTo, 'assignedTo');
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      throw new AppError('Assigned user not found', 404);
    }
  }

  if (dueDate !== undefined) {
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      throw new AppError('Invalid due date format', 400);
    }
  }

  if (status !== undefined) {
    validators.validateEnum(status, ['Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled'], 'status');
  }

  if (priority !== undefined) {
    validators.validateEnum(priority, ['Low', 'Medium', 'High', 'Critical'], 'priority');
  }

  if (notes !== undefined && notes.trim().length > 2000) {
    throw new AppError('Notes cannot exceed 2000 characters', 400);
  }

  if (completedAt !== undefined && completedAt !== null) {
    const completedDate = new Date(completedAt);
    if (isNaN(completedDate.getTime())) {
      throw new AppError('Invalid completion date format', 400);
    }
  }

  // Prepare update data
  const updateData = {};
  if (title !== undefined) updateData.title = title.trim();
  if (description !== undefined) updateData.description = description.trim();
  if (entityId !== undefined) updateData.entityId = entityId;
  if (regulationId !== undefined) updateData.regulationId = regulationId;
  if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
  if (status !== undefined) updateData.status = status;
  if (priority !== undefined) updateData.priority = priority;
  if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
  if (notes !== undefined) updateData.notes = notes.trim();
  if (completedAt !== undefined) updateData.completedAt = completedAt ? new Date(completedAt) : null;

  // Update task
  let updated;
  try {
    updated = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'email role')
      .populate('createdBy', 'email role')
      .populate('entityId', 'name type')
      .populate('regulationId', 'title code');
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map(e => e.message)
        .join(', ');
      throw new AppError(message, 400);
    }
    console.error('Task update error:', error);
    throw new AppError('Failed to update task', 500);
  }

  if (!updated) {
    throw new AppError('Task not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: {
      ...updated.toObject(),
      id: updated._id,
    },
  });
});

/**
 * Delete a task
 * @route DELETE /api/tasks/:id
 * @param {string} id - Task ID (required, must be valid MongoDB ObjectId)
 */
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  validators.validateObjectId(id);

  // Delete task
  let deleted;
  try {
    deleted = await Task.findByIdAndDelete(id);
  } catch (error) {
    console.error('Task deletion error:', error);
    throw new AppError('Failed to delete task', 500);
  }

  if (!deleted) {
    throw new AppError('Task not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully',
    data: {
      id: deleted._id,
    },
  });
});