const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: String,
  description: String,
  entityId: String,
  regulationId: String,
  assignedTo: String,
  status: String,
  priority: String,
  dueDate: Date,
  createdBy: String,
}, { timestamps: true });

module.exports = mongoose.model("Task", schema);