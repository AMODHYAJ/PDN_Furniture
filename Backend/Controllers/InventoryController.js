const Inventory = require("../Model/InventoryModel");
const Notification = require("../Model/NotificationModel");
const Product = require("../Model/ProductModel");
const User = require("../Model/UserModel");

// Get all inventory items (raw materials)
const getAllInventory = async (req, res, next) => {
    let inventoryItems;

    // Get all inventory items
    try {
        inventoryItems = await Inventory.find();
    } catch (err) {
        console.log(err);
    }

    // Inventory not found
    if (!inventoryItems) {
        return res.status(404).json({ message: "Inventory not found" });
    }

    // Display all inventory items
    return res.status(200).json({ inventoryItems });
};

// Add raw material to inventory with low stock check
const addInventory = async (req, res, next) => {
  const { materialName, quantity, unit, wastageQuantity, availability, reorderThreshold } = req.body;
  
  try {
    const inventoryItem = new Inventory({ 
      materialName, 
      quantity, 
      unit, 
      wastageQuantity, 
      availability,
      reorderThreshold
    });
    
    await inventoryItem.save();

    // Check for low stock condition on new items
    await checkAndNotifyLowStock(inventoryItem, req);

    return res.status(201).json({ 
      success: true,
      inventoryItem 
    });
  } catch (err) {
    console.error("Error adding inventory item:", err);
    return res.status(500).json({ 
      success: false,
      message: "Server error, unable to add inventory item" 
    });
  }
};

// Get inventory item by ID
const getInventoryById = async (req, res, next) => {
    const id = req.params.id;

    let inventoryItem;

    try {
        inventoryItem = await Inventory.findById(id);
    } catch (err) {
        console.log(err);
    }

    // Inventory item not available
    if (!inventoryItem) {
        return res.status(404).json({ message: "Inventory item not found" });
    }

    // If inventory item found
    return res.status(200).json({ inventoryItem });
};

// Update inventory item with improved low stock detection
const updateInventory = async (req, res, next) => {
  try {
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: "Inventory item not found" });
    }

    // Check if stock is low (either below reorderThreshold or below 10 if threshold not set)
    const isLowStock = updatedItem.quantity <= (updatedItem.reorderThreshold || 10);
    
    if (isLowStock) {
      // Get all admin/inventory manager users
      const recipients = await User.find({
        role: { $in: ['Admin', 'inventory_manager'] }
      }).select('_id');

      // Create and send notifications immediately
      await Promise.all(recipients.map(async user => {
        const notification = await Notification.create({
          recipient: user._id,
          title: 'Low Stock Alert',
          message: `${updatedItem.materialName} is below ${updatedItem.reorderThreshold ? 'reorder threshold' : 'minimum stock level'} (${updatedItem.quantity} ${updatedItem.unit} remaining)`,
          type: 'low_stock',
          relatedEntity: updatedItem._id,
          entityType: 'Inventory',
          priority: updatedItem.quantity <= 0 ? 'critical' : 'high'
        });

        // Send real-time notification immediately
        if (req.app?.locals?.sendNotification) {
          req.app.locals.sendNotification(user._id, {
            _id: notification._id,
            title: notification.title,
            message: notification.message,
            isRead: false,
            createdAt: new Date()
          });
        }
      }));
    }

    res.status(200).json({ 
      success: true,
      inventoryItem: updatedItem,
      isLowStock
    });
  } catch (err) {
    console.error("Error updating inventory:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error, unable to update inventory item" 
    });
  }
};

// Delete inventory item
const deleteInventory = async (req, res, next) => {
    const id = req.params.id;

    let inventoryItem;

    try {
        inventoryItem = await Inventory.findByIdAndDelete(id);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error, unable to delete inventory item" });
    }

    // Inventory item not found
    if (!inventoryItem) {
        return res.status(404).json({ message: "Inventory item not found or already deleted" });
    }

    return res.status(200).json({ message: "Inventory item deleted successfully", inventoryItem });
};

// Search for specific inventory item 
const searchInventory = async (req, res, next) => {
    const searchTerm = req.query.searchTerm;  // Get the search term 

    if (!searchTerm) {
        return res.status(400).json({ message: "Search term is required" });
    }

    try {
        // Retrieve all items from the database
        const items = await Inventory.find();
        
        // Filter items based on the search term
        const filteredItems = items.filter(item =>
            item.materialName.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // If no matching items are found
        if (filteredItems.length === 0) {
            return res.status(404).json({ message: "No items found matching the search term" });
        }

        // Display the filtered list of items
        return res.status(200).json({ filteredItems });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error searching inventory" });
    }
};

// Alert for low stock levels with real-time notifications
const alertLowStockLevels = async (req, res, next) => {
  try {
    // Retrieve all items from the database
    const items = await Inventory.find();
    
    // Filter items with low stock (below reorder threshold or below 10 if threshold not set)
    const lowStockItems = items.filter(item => 
      item.quantity <= (item.reorderThreshold || 10)
    );

    // If there are items with low stock
    if (lowStockItems.length > 0) {
      // Get all admin/inventory manager users
      const recipients = await User.find({
        role: { $in: ['Admin', 'inventory_manager'] }
      }).select('_id');

      // Create and send notifications for each low stock item
      await Promise.all(lowStockItems.map(async item => {
        await Promise.all(recipients.map(async user => {
          const notification = await Notification.create({
            recipient: user._id,
            title: 'Low Stock Alert',
            message: `${item.materialName} is below ${item.reorderThreshold ? 'reorder threshold' : 'minimum stock level'} (${item.quantity} ${item.unit} remaining)`,
            type: 'low_stock',
            relatedEntity: item._id,
            entityType: 'Inventory',
            priority: item.quantity <= 0 ? 'critical' : 'high'
          });

          // Send real-time notification if available
          if (req.app?.locals?.sendNotification) {
            req.app.locals.sendNotification(user._id, {
              _id: notification._id,
              title: notification.title,
              message: notification.message,
              isRead: false,
              createdAt: new Date()
            });
          }
        }));
      }));

      return res.status(200).json({ 
        success: true,
        message: `${lowStockItems.length} low stock items found`,
        lowStockItems 
      });
    } else {
      return res.status(200).json({ 
        success: true,
        message: "No items are low on stock",
        lowStockItems: [] 
      });
    }
  } catch (err) {
    console.error("Error checking low stock levels:", err);
    return res.status(500).json({ 
      success: false,
      message: "Error checking low stock levels" 
    });
  }
};

// Generate a report on inventory levels
const generateInventoryReports = async (req, res, next) => {
    try {
        // Retrieve all items from the database
        const items = await Inventory.find();
        
        // Analyze inventory data (e.g., total stock and wastage)
        const totalStock = items.reduce((acc, item) => acc + item.quantity, 0);
        const totalWastage = items.reduce((acc, item) => acc + item.wastageQuantity, 0);
        const totalItems = items.length;

        // Generate inventory report
        const inventoryReport = {
            totalStock,
            totalWastage,
            totalItems,
            date: new Date()
        };

        // Display the generated inventory report
        return res.status(200).json({ inventoryReport });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error generating inventory report" });
    }
};

// Utility function to check and notify low stock
const checkAndNotifyLowStock = async (item, req) => {
  const isLowStock = item.quantity <= (item.reorderThreshold || 10);
  
  if (isLowStock) {
    const recipients = await User.find({
      role: { $in: ['Admin', 'inventory_manager'] }
    }).select('_id');

    await Promise.all(recipients.map(async user => {
      const notification = await Notification.create({
        recipient: user._id,
        title: 'Low Stock Alert',
        message: `${item.materialName} is below ${item.reorderThreshold ? 'reorder threshold' : 'minimum stock level'} (${item.quantity} ${item.unit} remaining)`,
        type: 'low_stock',
        relatedEntity: item._id,
        entityType: 'Inventory',
        priority: item.quantity <= 0 ? 'critical' : 'high'
      });

      if (req.app?.locals?.sendNotification) {
        req.app.locals.sendNotification(user._id, {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          isRead: false,
          createdAt: new Date()
        });
      }
    }));
  }

  return isLowStock;
};

exports.getAllInventory = getAllInventory;
exports.addInventory = addInventory;
exports.getInventoryById = getInventoryById;
exports.updateInventory = updateInventory;
exports.deleteInventory = deleteInventory;
exports.searchInventory = searchInventory;
exports.alertLowStockLevels = alertLowStockLevels;
exports.generateInventoryReports = generateInventoryReports;
exports.checkAndNotifyLowStock = checkAndNotifyLowStock;