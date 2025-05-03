const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  if (req.user.role === "Admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Admin privileges required"
  });
};

module.exports = isAdmin;