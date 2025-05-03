const express = require("express");
const router = express.Router();
const WishlistController = require("../Controllers/WishlistController");
const authenticate = require("../middleware/authenticate");

// Apply authentication middleware to all wishlist routes
router.use(authenticate);

// Add item to wishlist
router.post("/add", WishlistController.addItemToWishlist);

// Get user's wishlist
router.get("/user/:userId", WishlistController.getWishlist);

// Remove item from wishlist
router.delete("/remove/:userId/:productId", WishlistController.removeFromWishlist);

// Move item to cart
router.post("/move-to-cart/:userId", WishlistController.moveToCart);

// Clear wishlist
router.delete("/clear/:userId", WishlistController.clearWishlist);

module.exports = router;