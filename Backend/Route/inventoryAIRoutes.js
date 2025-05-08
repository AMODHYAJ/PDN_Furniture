const express = require("express");
const router = express.Router();
const InventoryAIController = require("../Controllers/InventoryAIController");
const { authenticate, authorize } = require("../middleware/auth");

// Get AI recommendations
router.get("/recommendations", 
  authenticate, 
  authorize(['inventory_manager', 'Admin']),
  async (req, res) => {
    try {
      const recommendations = await InventoryAIController.generateRecommendations();
      res.json({
        success: true,
        recommendations
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Auto-replenishment endpoint (matches frontend)
router.post("/auto-replenish", 
  authenticate, 
  authorize(['inventory_manager', 'Admin']), 
  async (req, res) => {
    try {
      const { materialId, quantity, materialName, unit } = req.body;
      const result = await InventoryAIController.createReplenishmentOrder(
        req,
        materialId,
        quantity,
        materialName,
        unit
      );
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;