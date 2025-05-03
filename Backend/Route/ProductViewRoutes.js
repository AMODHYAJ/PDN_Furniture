const express = require('express');
const router = express.Router();
const productViewController = require('../Controllers/ProductViewController');

// Route to track product view
router.get('/product/:id', productViewController.trackProductView);

// Route to get product view count
router.get('/product/viewcount/:id', productViewController.getProductViewCount);

// Increment View Count in the Backend (Node.js/Express)
router.put('/api/product/increment-viewcount/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        product.viewCount += 1;
        await product.save();
        res.status(200).json({ viewCount: product.viewCount });
    } catch (error) {
        res.status(500).json({ message: 'Error updating view count' });
    }
});


module.exports = router;