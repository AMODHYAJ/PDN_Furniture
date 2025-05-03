// controllers/exportController.js
const Product = require('../Model/ProductModel');
const XLSX = require('xlsx');

exports.exportProducts = async (req, res) => {
    try {
        // Fetch all products from the database
        const products = await Product.find();

        // Convert products data to an array of objects suitable for the Excel file
        const data = products.map(product => ({
            Name: product.name,
            Category: product.category,
            Price: product.price,
            Material: product.material,
            Availability: product.availability ? 'Available' : 'Not Available',
        }));

        // Create a new workbook and add the data
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Products');

        // Write the workbook to a buffer
        const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

        // Set headers and send the Excel file as a response
        res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (error) {
        console.error('Error exporting products:', error);
        res.status(500).json({ message: 'Error exporting products' });
    }
};