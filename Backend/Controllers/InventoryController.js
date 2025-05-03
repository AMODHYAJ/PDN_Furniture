const InventoryModel = require("../Model/InventoryModel");
const Inventory = require("../Model/InventoryModel");
const Product = require("../Model/ProductModel");

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

// Add raw material to inventory
const addInventory = async (req, res, next) => {
    const { materialName, quantity, unit, wastageQuantity, availability } = req.body;
    console.log("Request Body:", req.body);
    
    let inventoryItem;

    try {
        inventoryItem = new Inventory({ materialName, quantity, unit, wastageQuantity, availability });
        await inventoryItem.save();
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error, unable to add inventory item" });
    }

    // Unable to add inventory item
    if (!inventoryItem) {
        return res.status(400).json({ message: "Unable to add inventory item" });
    }

    return res.status(201).json({ inventoryItem });
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

// Update inventory item
const updateInventory = async (req, res, next) => {
    const id = req.params.id;
    const { materialName, quantity, unit, wastageQuantity, availability } = req.body;

    let inventoryItem;

    try {
        inventoryItem = await Inventory.findByIdAndUpdate(
            id,
            { materialName, quantity, unit, wastageQuantity, availability },
            { new: true } // Returns the updated document
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error, unable to update inventory item" });
    }

    // Inventory item not found
    if (!inventoryItem) {
        return res.status(404).json({ message: "Inventory item not found or update failed" });
    }

    return res.status(200).json({ inventoryItem });
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

// Alert for low stock levels
const alertLowStockLevels = async (req, res, next) => {
    try {
        // Retrieve all items from the database
        const items = await Inventory.find();
        
        // Filter items with low stock (for example, stock < 10)
        const lowStockItems = items.filter(item => item.quantity < 10);

        // If there are items with low stock
        if (lowStockItems.length > 0) {
            // Simulate informing the supplier (you can replace this with an actual alert method)
            console.log("Low stock alert for items:", lowStockItems);
            return res.status(200).json({ lowStockItems });
        } else {
            return res.status(200).json({ message: "No items are low on stock." });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Error checking low stock levels" });
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




exports.getAllInventory = getAllInventory;
exports.addInventory = addInventory;
exports.getInventoryById = getInventoryById;
exports.updateInventory = updateInventory;
exports.deleteInventory = deleteInventory;
exports.searchInventory = searchInventory;
exports.alertLowStockLevels = alertLowStockLevels;
exports.generateInventoryReports = generateInventoryReports;