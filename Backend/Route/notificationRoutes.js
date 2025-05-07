const express = require("express");
const router = express.Router();
const notificationController = require("../Controllers/NotificationController");
const authenticate = require("../middleware/authenticate");

// Get user notifications
router.get("/", authenticate, notificationController.getUserNotifications);

// Mark as read
router.patch("/:id/read", authenticate, notificationController.markAsRead);

// Mark all as read
router.patch("/read-all", authenticate, notificationController.markAllAsRead);

// Delete notification
router.delete("/:id", authenticate, notificationController.deleteNotification);

module.exports = router;