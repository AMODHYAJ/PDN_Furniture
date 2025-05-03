// In your routes file (probably routes/productRoutes.js)
const express = require("express");
const router = express.Router();
const productController = require("../Controllers/ProductController");
const upload = require("../middleware/upload"); // Make sure this path is correct

router.get("/", productController.getAllProducts);
router.post("/", upload.single('image'), productController.addProduct); // 'image' should match the field name in FormData
router.get("/:id", productController.getById);
router.put("/:id", upload.single('image'), productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;