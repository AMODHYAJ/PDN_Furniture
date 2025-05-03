const express = require('express');
const router = express.Router();
const { generateInventoryPDFReport } = require('../Controllers/inventoryReportController');

router.get('/generate-inventory-report', generateInventoryPDFReport);

module.exports = router;