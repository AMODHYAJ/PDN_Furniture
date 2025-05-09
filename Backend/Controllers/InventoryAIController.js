const Inventory = require("../Model/InventoryModel");
const Notification = require("../Model/NotificationModel");
const Product = require("../Model/ProductModel");
const User = require("../Model/UserModel");

class InventoryAIController {
  static async autoReplenishCheck(req) {
    try {
      const lowStockItems = await Inventory.find({
        $expr: { $lte: ['$quantity', '$reorderThreshold'] },
        autoReorder: true
      }).populate('supplier');

      const results = [];
      
      const recipients = await User.find({
        role: { $in: ['Admin', 'inventory_manager'] }
      }).select('_id');

      for (const item of lowStockItems) {
        const orderQuantity = Math.max(
          item.supplier.minimumOrder,
          Math.ceil((item.optimalStockLevel - item.quantity) * 1.2)
        );

        const notificationPromises = recipients.map(user => 
          Notification.create({
            recipient: user._id,
            title: `Auto-Replenishment Order for ${item.materialName}`,
            message: `System generated order for ${orderQuantity} ${item.unit}`,
            type: 'replenishment',
            relatedEntity: item._id,
            entityType: 'Inventory',
            priority: item.quantity <= 0 ? 'critical' : 'high'
          })
        );

        const notifications = await Promise.all(notificationPromises);

        if (req?.app?.locals?.sendNotification) {
          notifications.forEach(notification => {
            req.app.locals.sendNotification(notification.recipient, {
              _id: notification._id,
              title: notification.title,
              message: notification.message,
              isRead: false,
              createdAt: new Date()
            });
          });
        }

        item.lastOrderedDate = new Date();
        await item.save();

        results.push({
          materialId: item._id,
          materialName: item.materialName,
          quantity: orderQuantity,
          unit: item.unit,
          status: 'ordered'
        });
      }
      
      return { 
        success: true,
        processed: lowStockItems.length,
        results 
      };
    } catch (error) {
      console.error('Auto-replenish error:', error);
      throw error;
    }
  }

  static async generateRecommendations() {
    try {
      const items = await Inventory.find({
        $expr: { $lte: ['$quantity', '$reorderThreshold'] }
      }).populate('supplier');

      const recommendations = await Promise.all(items.map(async (item) => {
        const productsUsingMaterial = await Product.find({ 
          material: item.materialName 
        });
        
        const weeklyUsage = productsUsingMaterial.reduce((sum, product) => {
          return sum + (product.weeklyUsageEstimate || 2);
        }, 0);

        const recommendedOrder = Math.max(
          item.supplier?.minimumOrder || 0,
          Math.ceil(weeklyUsage * (item.leadTime / 7) * 1.2)
        );

        return {
          _id: item._id,
          materialName: item.materialName,
          currentStock: item.quantity,
          unit: item.unit,
          reorderThreshold: item.reorderThreshold,
          optimalStockLevel: item.optimalStockLevel,
          recommendedOrder,
          leadTime: item.leadTime,
          priority: item.quantity <= 0 ? 'CRITICAL' : 
                   item.quantity < item.reorderThreshold ? 'HIGH' : 'MEDIUM',
          status: item.quantity <= 0 ? 'Out of Stock' : 
                 item.quantity < item.reorderThreshold ? 'Low Stock' : 'In Stock',
          weeklyUsage
        };
      }));

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

// In InventoryAIController.js
static async createReplenishmentOrder(req, materialId, quantity, materialName, unit) {
  try {
    // 1. First update the inventory quantity
    const updatedItem = await Inventory.findByIdAndUpdate(
      materialId,
      { 
        $inc: { quantity: quantity },
        lastOrderedDate: new Date() 
      },
      { new: true }
    );

    if (!updatedItem) {
      throw new Error('Inventory item not found');
    }

    // 2. Create and send notifications immediately
    const recipients = await User.find({
      role: { $in: ['Admin', 'inventory_manager'] }
    }).select('_id');

    const notifications = await Promise.all(recipients.map(async user => {
      const notification = await Notification.create({
        recipient: user._id,
        title: `Replenishment Order - ${materialName}`,
        message: `Added ${quantity} ${unit} to inventory. New stock: ${updatedItem.quantity} ${unit}`,
        type: 'replenishment',
        relatedEntity: materialId,
        entityType: 'Inventory',
        priority: 'high'
      });

      // Send real-time notification immediately
      if (req.app.locals.sendNotification) {
        req.app.locals.sendNotification(user._id, {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          isRead: false,
          createdAt: new Date()
        });
      }

      return notification;
    }));

    return {
      materialId,
      materialName,
      quantity,
      unit,
      newQuantity: updatedItem.quantity,
      status: 'completed',
      orderedAt: new Date(),
      notifications
    };
  } catch (error) {
    console.error('Create replenishment error:', error);
    throw error;
  }
}
}

module.exports = InventoryAIController;