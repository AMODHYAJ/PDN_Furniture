// routes/analyticsRoutes.js
const express = require('express');
const ProductModel = require('../Model/ProductModel');  // Assuming you have a product model

const router = express.Router();

// Example endpoint to get product analytics
router.get('/product-analytics', async (req, res) => {
    try {
        // Fetch total products count
        const totalProducts = await ProductModel.countDocuments();

        // Fetch category distribution
        const categoryDistribution = await ProductModel.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },  // Group by category
            { $sort: { count: -1 } }  // Sort categories by count (descending)
        ]);

        // Fetch price range (min and max prices)
        const priceRange = await ProductModel.aggregate([
            { $group: { 
                _id: null, 
                minPrice: { $min: "$price" }, 
                maxPrice: { $max: "$price" } 
            } }
        ]);

        // If no products exist, set default price range
        if (!priceRange.length) {
            priceRange.push({ minPrice: 0, maxPrice: 0 });
        }

        res.json({ totalProducts, categoryDistribution, priceRange: priceRange[0] });
    } catch (err) {
        console.error('Error fetching product analytics data:', err);
        res.status(500).json({ message: 'Error fetching product analytics data' });
    }
});

module.exports = router;