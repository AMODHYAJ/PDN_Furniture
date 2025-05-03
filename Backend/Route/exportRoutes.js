// routes/exportRoute.js
const express = require('express');
const router = express.Router();
const exportController = require('../Controllers/exportController');

// Export products as Excel file
router.get('/products/export', exportController.exportProducts);

module.exports = router;