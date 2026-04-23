const AppError = require('../utils/AppError');

module.exports = (...roles) => {
  return (req, res, next) => {
    try {
      // Verify user is authenticated (authMiddleware should run first)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated',
          statusCode: 401,
          timestamp: new Date().toISOString(),
        });
      }

      // Validate user role exists
      if (!req.user.role) {
        console.error('User role is missing from token');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error',
          statusCode: 500,
          timestamp: new Date().toISOString(),
        });
      }

      // Check if user role is in allowed roles
      if (!roles.includes(req.user.role)) {
        console.warn(
          `Access denied: User ${req.user.id} with role '${req.user.role}' attempted to access resource requiring roles: [${roles.join(', ')}]`
        );
        
        return res.status(403).json({
          success: false,
          message: `Access Denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
          statusCode: 403,
          timestamp: new Date().toISOString(),
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      });
    }
  };
};