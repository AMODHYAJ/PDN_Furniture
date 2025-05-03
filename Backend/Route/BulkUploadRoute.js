const express = require('express');
const router = express.Router();
const multer = require('multer');
const BulkUploadController = require('../Controllers/BulkUploadController'); // Make sure the controller path is correct
const path = require('path');

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Ensure extension is preserved
    }
});

// Only allow Excel files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Please upload a valid Excel file.'));
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Bulk upload route
router.post('/bulk-upload', upload.single('file'), BulkUploadController.bulkUploadProducts);

module.exports = router;