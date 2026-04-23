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