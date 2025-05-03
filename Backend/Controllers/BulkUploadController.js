const XLSX = require('xlsx'); // Add this line at the top
const Product = require('../Model/ProductModel');

exports.bulkUploadProducts = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert Excel to JSON data
    let productsData = XLSX.utils.sheet_to_json(sheet);

    // Convert "Available" / "Not Available" to true/false for availability
    productsData = productsData.map(product => ({
        ...product,
        availability: product.availability === "Available" ? true : false
    }));

    try {
        const products = await Product.insertMany(productsData);
        res.status(200).send({
            message: 'Products uploaded successfully',
            products
        });
    } catch (error) {
        console.error('Error uploading products:', error);
        res.status(500).send('Server error while uploading products.');
    }
};