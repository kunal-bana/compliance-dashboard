const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

module.exports = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
    }

    // Check Bearer scheme
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization header format. Use: Bearer <token>',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
    }

    const token = parts[1];

    // Verify token exists and JWT_SECRET is configured
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validate decoded payload structure
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
    }

    // Attach user data to request
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // Handle JWT specific errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired, please login again',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or malformed token',
        statusCode: 401,
        timestamp: new Date().toISOString(),
      });
    }

    // Generic error
    console.error('Authentication error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }
};