const express = require("express");
const router = express.Router();
const InventoryAI = require("../Controllers/InventoryAI");
const { authenticate, authorize } = require("../middleware/auth");

// Auto-replenishment endpoint (runs daily via cron)
router.post("/auto-replenish", 
  authenticate, 
  authorize(['inventory_manager', 'admin']), 
  InventoryAI.autoReplenishCheck
);

// Material impact analysis
router.get("/impact/:materialId", 
  authenticate, 
  authorize(['inventory_manager', 'admin', 'production_manager']),
  InventoryAI.getMaterialImpact
);

module.exports = router;