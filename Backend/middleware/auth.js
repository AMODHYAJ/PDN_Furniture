const jwt = require("jsonwebtoken");

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false,
      message: "Access denied. No valid token provided." 
    });
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ 
      success: false,
      message: "Invalid or expired token." 
    });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};