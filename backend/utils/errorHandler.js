module.exports = (err, req, res, next) => {
  console.error("ERROR:", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
};