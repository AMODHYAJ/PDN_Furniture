const Notification = require("../Model/NotificationModel");

// Create a new notification
exports.createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { limit = 20, page = 1, unreadOnly } = req.query;
    const skip = (page - 1) * limit;

    const query = { 
      recipient: req.userId,
      ...(unreadOnly === 'true' && { isRead: false })
    };

    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('sender', 'name email role')
      .lean();

    const total = await Notification.countDocuments(query);

    res.json({
      success: true,
      notifications,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch notifications" 
    });
  }
};

// Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: req.params.id, 
        recipient: req.userId 
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: "Notification not found" 
      });
    }

    res.json({ 
      success: true,
      notification 
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update notification" 
    });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ 
      success: true,
      message: "All notifications marked as read" 
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update notifications" 
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.userId
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: "Notification not found" 
      });
    }

    res.json({ 
      success: true,
      message: "Notification deleted" 
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to delete notification" 
    });
  }
};

// Notification utilities
exports.notificationUtils = {
  createLowStockAlert: async (inventoryItem) => {
    return exports.createNotification({
      recipient: inventoryItem.lastUpdatedBy, // or admin ID
      title: "Low Stock Alert",
      message: `${inventoryItem.materialName} is below reorder threshold (${inventoryItem.quantity} ${inventoryItem.unit} remaining)`,
      type: "low_stock",
      relatedEntity: inventoryItem._id,
      entityType: "Inventory",
      priority: inventoryItem.quantity <= 0 ? "critical" : "high"
    });
  },

  createReplenishmentNotification: async (materialId, quantity, recipientId) => {
    return exports.createNotification({
      recipient: recipientId,
      title: "Inventory Replenishment Needed",
      message: `Suggested order: ${quantity} units`,
      type: "replenishment",
      relatedEntity: materialId,
      entityType: "Inventory",
      priority: "high",
      actionUrl: `/inventory/replenish/${materialId}`
    });
  }
};