const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true }, // Product Name
  category: { type: String, required: true }, // Category
  price: { type: Number, required: true }, // Product Price
  material: { type: String, required: true }, // Material
  availability: { type: Boolean, default: true }, // In Stock or Out of Stock
  image: { type: String }, // Product Image URL
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model("ProductModel", productSchema);