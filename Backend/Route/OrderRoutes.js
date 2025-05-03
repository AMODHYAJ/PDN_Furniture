const express = require("express");
const router = express.Router();

// Import order controller
const OrderController = require("../Controllers/OrderController");
const authenticate = require("../middleware/authenticate");
const isAdmin = require("../middleware/isAdmin");

// Order routes
router.post("/", authenticate, OrderController.createOrder);
router.get("/:id", authenticate, OrderController.getOrderById);
router.get("/user/my-orders", authenticate, OrderController.getUserOrders);
router.get('/user/history', authenticate, OrderController.getOrderHistory);
router.put('/:id/cancel', authenticate, OrderController.cancelOrder);
router.get('/:id/tracking', authenticate, OrderController.getTrackingInfo);

// Admin routes with proper middleware chaining
router.get("/admin/all-orders", 
    authenticate, 
    isAdmin, 
    OrderController.getAllOrders
  );
  
  router.get("/admin/stats", 
    authenticate, 
    isAdmin, 
    OrderController.getOrderStats
  );
  
  router.put("/admin/:id/update-status", 
    authenticate, 
    isAdmin, 
    OrderController.updateOrderStatus
  );
  
  router.get("/admin/:id", 
    authenticate, 
    isAdmin, 
    OrderController.getAdminOrderById
  );
  
  module.exports = router;
