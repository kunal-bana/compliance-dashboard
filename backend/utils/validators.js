const AppError = require('./AppError');

const validators = {
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }
  },

  validatePassword: (password) => {
    if (!password || password.length < 6) {
      throw new AppError('Password must be at least 6 characters long', 400);
    }
  },

  validateRequired: (obj, fields) => {
    const missing = fields.filter(field => !obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === ''));
    if (missing.length > 0) {
      throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
    }
  },

  validateObjectId: (id) => {
    if (!id || id === 'undefined' || !/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new AppError('Invalid ID format', 400);
    }
  },

  validateEnum: (value, allowedValues, fieldName) => {
    if (!allowedValues.includes(value)) {
      throw new AppError(`Invalid ${fieldName}. Allowed values: ${allowedValues.join(', ')}`, 400);
    }
  },
};

module.exports = validators;