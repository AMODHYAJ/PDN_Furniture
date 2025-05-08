const express = require("express");
const router = express.Router();
const InventoryAI = require("../Controllers/InventoryAIController");
const { authenticate, authorize } = require("../middleware/auth");

// Get AI recommendations
router.get("/recommendations", 
  authenticate, 
  authorize(['inventory_manager', 'Admin']),
  async (req, res) => {
    try {
      const recommendations = await InventoryAI.generateRecommendations();
      res.json({
        success: true,
        recommendations: recommendations.map(item => ({
          _id: item._id,
          materialName: item.materialName,
          currentStock: item.currentStock,
          unit: item.unit,
          recommendedOrder: item.recommendedOrder,
          leadTime: item.leadTime,
          priority: item.priority,
          status: item.status,
          notes: `Reorder when stock falls below ${item.reorderThreshold} ${item.unit}`
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
);

// Auto-replenishment endpoint
router.post("/auto-replenish", 
  authenticate, 
  authorize(['inventory_manager', 'Admin']), 
  async (req, res) => {
    try {
      const { materialId, quantity } = req.body;
      // In a real implementation, you would process the order here
      res.json({
        success: true,
        message: `Order for ${quantity} units created successfully`
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