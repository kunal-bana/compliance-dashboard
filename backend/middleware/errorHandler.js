const AppError = require('../utils/AppError');

module.exports = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log errors for debugging
  const logLevel = statusCode >= 500 ? 'ERROR' : 'WARN';
  console.error(`[${logLevel}] ${new Date().toISOString()} - ${statusCode}: ${message}`);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
    message = `Validation Error: ${messages}`;
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  }

  // Handle Mongoose cast error
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token or token has expired';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired, please login again';
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Prepare response
  const response = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development') {
    response.error = {
      name: err.name,
      stack: err.stack,
    };
  }

  // Send response
  res.status(statusCode).json(response);
};