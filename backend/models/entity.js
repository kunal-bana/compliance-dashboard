const mongoose = require('mongoose');

const entitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Entity name is required'],
      trim: true,
      minlength: [2, 'Entity name must be at least 2 characters'],
      maxlength: [100, 'Entity name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Entity type is required'],
      trim: true,
      minlength: [2, 'Entity type must be at least 2 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive', 'Pending', 'Suspended'],
        message: 'Status must be Active, Inactive, Pending, or Suspended',
      },
      default: 'Active',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
entitySchema.index({ name: 1 });
entitySchema.index({ status: 1 });
entitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Entity', entitySchema);