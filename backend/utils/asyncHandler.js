/**
 * Wrapper for async route handlers to catch errors and pass to error handler middleware
 * Eliminates need for try-catch in every controller function
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware that catches errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Log error for debugging in development
      if (process.env.NODE_ENV !== 'production') {
        console.error('[AsyncHandler Error]:', error);
      }
      next(error);
    });
  };
};

module.exports = asyncHandler;