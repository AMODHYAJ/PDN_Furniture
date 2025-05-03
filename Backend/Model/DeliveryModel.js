const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true }, // Reference User Model
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "OrderModel", required: true },
  customerName: { type: String, required: true },
  deliveryOfficer: { type: String, required: true },
  estimatedDeliveryDate: { type: Date, required: true },
  deliveryNotes: { type: String },
  deliveryFee: { type: Number, required: true },
  trackingNumber: { type: String, required: true, unique: true },
  comments: { type: String },
  assignedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DeliveryModel", DeliverySchema);
