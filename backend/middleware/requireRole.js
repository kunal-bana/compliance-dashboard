module.exports = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.warn(`Forbidden: ${req.user.role} tried to access`);
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};