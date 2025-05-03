const express = require("express");
const router = express.Router();

// Import the raw material model
const RawMaterial = require("../Model/InventoryModel");

// Import the Inventory controller
const InventoryController = require("../Controllers/InventoryController");

// Import the search controller function
const { searchInventory } = require("../Controllers/InventoryController");

// Import the low stock alert controller function
const { alertLowStockLevels } = require("../Controllers/InventoryController");

// Import the inventory report generation controller function
const { generateInventoryReports } = require("../Controllers/InventoryController");


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