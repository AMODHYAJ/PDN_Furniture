const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
  materialName: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true },
  wastageQuantity: { type: Number, default: 0 },
  availability: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
  // New fields for AI functionality
  reorderThreshold: { 
    type: Number, 
    default: 5 
  },
  optimalStockLevel: { 
    type: Number, 
    required: true,
    default: 20
  },
  leadTime: { 
    type: Number,  // in days
    default: 7 
  },
  lastOrderedDate: Date,
  autoReorder: { 
    type: Boolean, 
    default: false 
  },
  supplier: {
    name: String,
    contact: String,
    email: String,
    minimumOrder: Number
  }
}, { timestamps: true });

module.exports = mongoose.model("InventoryModel", inventorySchema);