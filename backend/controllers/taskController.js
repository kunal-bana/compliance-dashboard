const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// GET ALL
exports.getAll = asyncHandler(async (req, res) => {
  const data = await Task.find().sort({ createdAt: -1 });

  const formatted = data.map((t) => ({
    ...t.toObject(),
    id: t._id,
  }));

  res.json(formatted);
});

// CREATE
exports.create = asyncHandler(async (req, res) => {
  const task = await Task.create({
    ...req.body,
    createdBy: req.user.id,
  });

  res.json({ ...task.toObject(), id: task._id });
});

// UPDATE
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || id === "undefined") {
    throw new AppError("Invalid ID", 400);
  }

  const updated = await Task.findByIdAndUpdate(id, req.body, { new: true });

  if (!updated) {
    throw new AppError("Task not found", 404);
  }

  res.json({ ...updated.toObject(), id: updated._id });
});

// DELETE
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || id === "undefined") {
    throw new AppError("Invalid ID", 400);
  }

  const deleted = await Task.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError("Task not found", 404);
  }

  res.json({ success: true });
});