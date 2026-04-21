const Entity = require("../models/entity");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// GET ALL
exports.getAll = asyncHandler(async (req, res) => {
  const data = await Entity.find().sort({ createdAt: -1 });

  const formatted = data.map((e) => ({
    ...e.toObject(),
    id: e._id,
  }));

  res.json(formatted);
});

// CREATE
exports.create = asyncHandler(async (req, res) => {
  const item = await Entity.create(req.body);
  res.json({ ...item.toObject(), id: item._id });
});

// UPDATE
exports.updateEntity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || id === "undefined") {
    throw new AppError("Invalid ID", 400);
  }

  const updated = await Entity.findByIdAndUpdate(id, req.body, { new: true });

  if (!updated) {
    throw new AppError("Entity not found", 404);
  }

  res.json({ ...updated.toObject(), id: updated._id });
});

// DELETE
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || id === "undefined") {
    throw new AppError("Invalid ID", 400);
  }

  await Entity.findByIdAndDelete(id);

  res.json({ success: true });
});