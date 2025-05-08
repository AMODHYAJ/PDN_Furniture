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

exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 5, unreadOnly } = req.query;
    
    const query = { 
      recipient: userId,
      ...(unreadOnly === 'true' && { isRead: false })
    };

    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      notifications: notifications.map(notif => ({
        ...notif,
        id: notif._id,
        formattedDate: new Date(notif.createdAt).toLocaleString()
      }))
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch notifications" 
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.body.recipient, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

// Add this to handle low stock notifications
exports.createLowStockNotification = async (inventoryItem, userId) => {
  try {
    return await this.createNotification({
      recipient: userId,
      title: "Low Stock Alert",
      message: `${inventoryItem.materialName} is below reorder threshold (${inventoryItem.quantity} ${inventoryItem.unit} remaining)`,
      type: "low_stock",
      relatedEntity: inventoryItem._id,
      entityType: "Inventory",
      priority: inventoryItem.quantity <= 0 ? "critical" : "high"
    });
  } catch (error) {
    console.error("Error creating low stock notification:", error);
    throw error;
  }
};