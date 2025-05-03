const express = require("express");
const router = express.Router();
const CartController = require("../Controllers/CartController");

router.get("/:userId", CartController.getCart);
router.post("/", CartController.addItemToCart);
router.delete("/:userId/:productId", CartController.removeFromCart);
router.put("/:userId/:productId", CartController.updateCartItemQuantity);
router.delete("/:userId/clear", CartController.clearCart);

module.exports = router;