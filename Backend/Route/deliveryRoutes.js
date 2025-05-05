const express = require("express");
const router = express.Router();
const {
  getAssignedOrders,
  updateDeliveryStatus,
  getDeliveryOfficers,
  getOrderTracking
} = require("../Controllers/deliveryController");
const authenticate = require("../middleware/authenticate");
const isAdmin = require("../middleware/isAdmin");


// Get all assigned orders
router.get("/assigned", authenticate, getAssignedOrders);

// Update delivery status
router.put("/:orderId/status", authenticate, updateDeliveryStatus);

// Get available delivery officers
router.get("/officers", authenticate, getDeliveryOfficers);

// Get order tracking info
router.get("/tracking/:orderId", authenticate, getOrderTracking);

module.exports = router;