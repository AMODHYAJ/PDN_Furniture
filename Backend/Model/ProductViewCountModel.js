const mongoose = require('mongoose');

// Define the ProductViewCount schema
const productViewCountSchema = new mongoose.Schema({
  productID: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Foreign key to Product
  viewCount: { type: Number, default: 0 }  // Default view count starts at 0
});

// Create the ProductViewCount model using the schema
const ProductViewCount = mongoose.model('ProductViewCount', productViewCountSchema);

module.exports = ProductViewCount;