const mongoose = require('mongoose');

const regulationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Regulation title is required'],
      trim: true,
      minlength: [3, 'Regulation title must be at least 3 characters'],
      maxlength: [150, 'Regulation title cannot exceed 150 characters'],
    },
    code: {
      type: String,
      required: [true, 'Regulation code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9\-]+$/, 'Code must contain only uppercase letters, numbers, and hyphens'],
    },
    status: {
      type: String,
      enum: {
        values: ['Active', 'Inactive', 'Pending', 'Archived'],
        message: 'Status must be Active, Inactive, Pending, or Archived',
      },
      default: 'Active',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    effectiveDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
regulationSchema.index({ status: 1 });
regulationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Regulation', regulationSchema);