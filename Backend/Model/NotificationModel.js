const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "UserModel",
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "UserModel"
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: [
      'inventory', 
      'order', 
      'production', 
      'delivery', 
      'system',
      'low_stock',
      'replenishment'
    ]
  },
  relatedEntity: {
    type: Schema.Types.ObjectId,
    required: true
  },
  entityType: {
    type: String,
    required: true,
    enum: [
      'Inventory', 
      'Product', 
      'Order', 
      'Production', 
      'Delivery'
    ]
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  actionUrl: String,
  expiryDate: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Indexes for faster queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1, priority: 1 });

notificationSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleString();
});

module.exports = mongoose.model("NotificationModel", notificationSchema);