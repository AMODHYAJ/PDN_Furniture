const Cart = require("../Model/CartModel");
const Product = require("../Model/ProductModel");

// Get Cart (with proper error handling)
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId })
            .populate("items.productId", "name price image")
            .lean();
        
        if (!cart) {
            return res.status(200).json({
                items: [],
                totalPrice: 0,
                totalQuantity: 0
            });
        }

        // Filter out items with null product references
        const validItems = cart.items.filter(item => item.productId) || [];
        
        // Calculate totals
        const totalPrice = validItems.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0);
        const totalQuantity = validItems.reduce((sum, item) => sum + item.quantity, 0);

        res.json({
            ...cart,
            items: validItems,
            totalPrice,
            totalQuantity
        });
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ 
            error: "Server error while fetching cart",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Add Item to Cart
const addItemToCart = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove Item from Cart
const removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Cart Item Quantity
const updateCartItemQuantity = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const { quantity } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Clear Cart (fixed implementation)
const clearCart = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find and update the cart in one operation
        const cart = await Cart.findOneAndUpdate(
            { userId },
            { $set: { items: [] } }, // Only clear the items array
            { new: true }
        ).populate("items.productId", "name price image");

        if (!cart) {
            return res.status(404).json({ error: "Cart not found" });
        }

        res.json({
            success: true,
            message: "Cart cleared successfully",
            cart: {
                ...cart.toObject(),
                items: [],
                totalPrice: 0,
                totalQuantity: 0
            }
        });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ 
            error: "Server error while clearing cart",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getCart,
    addItemToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart
};