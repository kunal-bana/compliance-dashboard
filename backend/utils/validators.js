const AppError = require('./AppError');

/**
 * Validation utilities for common input checks
 */
const validators = {
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @throws {AppError} If email is invalid
   */
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }
  },

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @throws {AppError} If password is weak
   */
  validatePassword: (password) => {
    if (!password || password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }
  },

  /**
   * Validate required fields
   * @param {Object} obj - Object containing fields to validate
   * @param {Array<string>} fields - Required field names
   * @throws {AppError} If any required field is missing or empty
   */
  validateRequired: (obj, fields) => {
    const missing = fields.filter(field => !obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === ''));
    if (missing.length > 0) {
      throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
    }
  },

  /**
   * Validate MongoDB ObjectId format
   * @param {string} id - ID to validate
   * @throws {AppError} If ID format is invalid
   */
  validateObjectId: (id) => {
    if (!id || id === 'undefined' || !/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new AppError('Invalid ID format', 400);
    }
  },

  /**
   * Validate enum values
   * @param {string} value - Value to check
   * @param {Array<string>} allowedValues - Allowed values
   * @param {string} fieldName - Field name for error message
   * @throws {AppError} If value is not in allowed list
   */
  validateEnum: (value, allowedValues, fieldName) => {
    if (!allowedValues.includes(value)) {
      throw new AppError(`Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`, 400);
    }
  },
};

module.exports = validators;