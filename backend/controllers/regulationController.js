const Regulation = require("../models/Regulation");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

// GET ALL
exports.getAll = asyncHandler(async (req, res) => {
  const data = await Regulation.find().sort({ createdAt: -1 });

  const formatted = data.map((r) => ({
    ...r.toObject(),
    id: r._id,
  }));

  res.json(formatted);
});

// CREATE
exports.create = asyncHandler(async (req, res) => {
  const item = await Regulation.create(req.body);
  res.json({ ...item.toObject(), id: item._id });
});

// UPDATE
exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || id === "undefined") {
    throw new AppError("Invalid ID", 400);
  }

  const updated = await Regulation.findByIdAndUpdate(id, req.body, { new: true });

  if (!updated) {
    throw new AppError("Regulation not found", 404);
  }

  res.json({ ...updated.toObject(), id: updated._id });
});

// DELETE
exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || id === "undefined") {
    throw new AppError("Invalid ID", 400);
  }

  const deleted = await Regulation.findByIdAndDelete(id);

  if (!deleted) {
    throw new AppError("Regulation not found", 404);
  }

  res.json({ success: true });
});