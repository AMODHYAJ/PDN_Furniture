const jwt = require("jsonwebtoken");

const agentAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "Access denied. No valid token provided." 
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Additional check for agent role if needed
    if (decoded.role !== 'delivery') {
      return res.status(403).json({
        success: false,
        message: "Access restricted to delivery agents"
      });
    }

    req.agent = decoded;
    next();
  } catch (error) {
    console.error("Agent auth failed:", error);
    res.status(401).json({ 
      success: false,
      message: "Invalid or expired token." 
    });
  }
};

module.exports = agentAuth;