const express = require('express');
const router = express.Router();
const { generateProductPDFReport } = require('../Controllers/productReportController');

router.get('/generate-report', generateProductPDFReport);

module.exports = router;