const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Inventory schema to handle raw materials and wastage
const inventorySchema = new Schema({
  materialName: { type: String, required: true },  // Raw material name
  quantity: { type: Number, required: true, default: 0 },  // Quantity of raw material
  unit: { type: String, required: true },  // Unit 
  wastageQuantity: { type: Number, default: 0 },  // Wastage quantity
  availability: { type: Boolean, default: true },  // Whether the material is in stock
  lastUpdated: { type: Date, default: Date.now },  // Last update timestamp
});

module.exports = mongoose.model(
  "InventoryModel", // Model name for raw materials and wastage
  inventorySchema  // Schema definition for raw materials and wastage
);
