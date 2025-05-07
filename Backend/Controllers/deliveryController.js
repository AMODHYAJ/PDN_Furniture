const Order = require("../Model/OrderModel");
const DeliveryOfficer = require("../Model/DeliveryOfficerModel");

// Get assigned orders
exports.getAssignedOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { deliveryStatus: { $ne: 'pending' } };
    
    if (status) {
      query.deliveryStatus = status;
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('deliveryOfficer', 'name phone')
      .sort('-shippedAt');
    
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch orders",
      error: error.message 
    });
  }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    if (!['in_transit', 'delivered', 'failed'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status" 
      });
    }
    
    const updateData = { deliveryStatus: status };
    
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
      updateData.status = 'delivered';
    }
    
    // Update the order
    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('userId deliveryOfficer', 'name email phone');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }
    
    // If status was changed to delivered, check if officer has other assigned orders
    if (status === 'delivered' && order.deliveryOfficer) {
      const assignedOrdersCount = await Order.countDocuments({
        deliveryOfficer: order.deliveryOfficer._id,
        deliveryStatus: { $in: ['assigned', 'in_transit'] }
      });
      
      // If no more assigned orders, set officer to available
      if (assignedOrdersCount === 0) {
        await DeliveryOfficer.findByIdAndUpdate(
          order.deliveryOfficer._id,
          { isAvailable: true }
        );
      }
    }
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to update status",
      error: error.message 
    });
  }
};

// Get available delivery officers
exports.getDeliveryOfficers = async (req, res) => {
  try {
    const officers = await DeliveryOfficer.find({ isAvailable: true });
    res.json({ success: true, officers });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch officers",
      error: error.message 
    });
  }
};

// Get order tracking info
exports.getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('userId', 'name email')
      .populate('deliveryOfficer', 'name phone');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }
    
    // Generate timeline events
    const trackingUpdates = [
      {
        status: 'processing',
        location: 'Warehouse',
        date: order.createdAt,
        description: 'Order received and being processed'
      }
    ];
    
    if (order.shippedAt) {
      trackingUpdates.push({
        status: 'shipped',
        location: 'Distribution Center',
        date: order.shippedAt,
        description: 'Order has been shipped'
      });
    }
    
    if (order.deliveryStatus === 'in_transit') {
      trackingUpdates.push({
        status: 'in_transit',
        location: 'In Transit',
        date: new Date(order.shippedAt.getTime() + 12 * 60 * 60 * 1000),
        description: 'Package is in transit'
      });
    }
    
    if (order.deliveredAt) {
      trackingUpdates.push({
        status: 'delivered',
        location: order.shippingAddress.city,
        date: order.deliveredAt,
        description: 'Order has been delivered'
      });
    }
    
    res.json({
      success: true,
      order,
      trackingUpdates,
      estimatedDelivery: order.estimatedDeliveryDate
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to get tracking info",
      error: error.message 
    });
  }
};