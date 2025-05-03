const Order = require('../Model/OrderModel');
const Cart = require('../Model/CartModel');
const Product = require('../Model/ProductModel');

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Order must contain at least one item" 
      });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ 
        success: false,
        message: "Complete shipping address is required" 
      });
    }

    // Process items with database validation
    let totalPrice = 0;
    const orderItems = [];
    
    for (const item of items) {
      // Validate item structure
      if (!item.product || !item.quantity) {
        return res.status(400).json({
          success: false,
          message: "Each item must contain product and quantity"
        });
      }

      // Get product from database
      const product = await Product.findById(item.product._id || item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product._id || item.product}`
        });
      }

      // Add to order items
      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Calculate total
      totalPrice += product.price * item.quantity;
    }

    // Create order
    const order = new Order({
      userId,
      items: orderItems,
      shippingAddress,
      paymentMethod: 'cashOnDelivery', // Set default
      totalPrice,
      status: 'processing'
    });

    const createdOrder = await order.save();

    // Clear cart
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } }
    );

    res.status(201).json({
      success: true,
      order: createdOrder
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create order',
      error: error.message 
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name price image')
      .lean(); // Convert to plain JavaScript object

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Ensure userId is included and properly formatted
    order.userId = order.userId?.toString();

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch order',
      error: error.message 
    });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .populate('items.productId', 'name price image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch orders',
      error: error.message 
    });
  }
};

// Get paginated order history
exports.getOrderHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.productId', 'name image');

    const count = await Order.countDocuments({ userId: req.userId });

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalOrders: count
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order history',
      error: error.message
    });
  }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { 
        _id: req.params.id, 
        userId: req.userId,
        status: 'processing'
      },
      { 
        $set: { 
          status: 'cancelled',
          cancelledAt: new Date() 
        } 
      },
      { new: true }
    ).populate('items.productId');

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled or not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// Get tracking information
exports.getTrackingInfo = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name image')
      .lean();

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Verify user owns this order
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    // Simulate tracking updates (in a real app, integrate with shipping provider API)
    let trackingUpdates = [];
    
    if (order.status === 'shipped' || order.status === 'delivered') {
      trackingUpdates = [
        {
          status: 'processing',
          location: 'Warehouse',
          date: order.createdAt,
          description: 'Order received and being processed'
        },
        {
          status: 'shipped',
          location: 'Distribution Center',
          date: order.shippedAt || new Date(order.createdAt.getTime() + 24 * 60 * 60 * 1000),
          description: 'Order has been shipped'
        }
      ];

      if (order.status === 'delivered') {
        trackingUpdates.push({
          status: 'delivered',
          location: order.shippingAddress.city,
          date: order.deliveredAt,
          description: 'Order has been delivered'
        });
      } else {
        trackingUpdates.push({
          status: 'in_transit',
          location: 'In Transit',
          date: new Date((order.shippedAt || new Date()).getTime() + 12 * 60 * 60 * 1000),
          description: 'Package is in transit'
        });
      }
    }

    res.json({
      success: true,
      order,
      trackingUpdates,
      estimatedDelivery: order.status === 'shipped' 
        ? new Date((order.shippedAt || new Date()).getTime() + 3 * 24 * 60 * 60 * 1000)
        : null
    });

  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get tracking information',
      error: error.message 
    });
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, sort = '-createdAt' } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price image')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const count = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalOrders: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
};

// Admin: Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalPrice' },
          processing: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
          shipped: { $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          totalOrders: 1,
          totalRevenue: 1,
          statusCounts: {
            processing: '$processing',
            shipped: '$shipped',
            delivered: '$delivered',
            cancelled: '$cancelled'
          }
        }
      }
    ]);

    // Get recent 5 orders
    const recentOrders = await Order.find()
      .sort('-createdAt')
      .limit(5)
      .populate('userId', 'name')
      .lean();

    res.json({
      success: true,
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        statusCounts: {
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0
        }
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const updateData = { status };
    
    // Add timestamps for specific status changes
    if (status === 'shipped') {
      updateData.shippedAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    } else if (status === 'cancelled') {
      updateData.cancelledAt = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('userId', 'name email')
    .populate('items.productId', 'name price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Admin: Get order by ID
exports.getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name price image')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};