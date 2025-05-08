const express = require("express");
const router = express.Router();
const InventoryController = require("../Controllers/InventoryController");

router.get("/", InventoryController.getAllInventory); 
router.post("/", InventoryController.addInventory);
router.get("/:id", InventoryController.getInventoryById); 
router.put("/:id", InventoryController.updateInventory); 
router.delete("/:id", InventoryController.deleteInventory); 
router.get("/search", InventoryController.searchInventory);
router.get("/alert-low-stock", InventoryController.alertLowStockLevels);
router.get("/report", InventoryController.generateInventoryReports);

// Export the router
module.exports = router;