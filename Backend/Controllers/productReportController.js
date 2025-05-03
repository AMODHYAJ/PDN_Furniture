const PDFDocument = require('pdfkit');
const fs = require('fs');
const ProductModel = require('../Model/ProductModel');
const DiscountModel = require('../Model/DiscountModel');

async function generateProductPDFReport(req, res) {
    try {
        console.log('Fetching products...');
        const products = await ProductModel.find();
        const discounts = await DiscountModel.find();

        console.log('Creating PDF...');
        // Change orientation to 'landscape'
        const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
        const filePath = './uploads/ProductReport.pdf';
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Title
        doc.fontSize(24).fillColor('#4CAF50').text('Product Report', { align: 'center' });
        doc.moveDown(1);

        // Table Header Styling
        const headerY = doc.y; // Save starting Y position for header
        doc.rect(50, headerY, 700, 30).fill('#4CAF50'); // Green header background
        doc.fontSize(12).fillColor('#ffffff')
            .text('Name', 60, headerY + 5, { continued: true, width: 160, align: 'left' })
            .text('Category', 220, headerY + 5, { continued: true, width: 130, align: 'left' })
            .text('Price', 370, headerY + 5, { continued: true, width: 70, align: 'right' })
            .text('Material', 450, headerY + 5, { continued: true, width: 120, align: 'left' })
            .text('Availability', 580, headerY + 5, { continued: true, width: 100, align: 'center' })
            .text('Discount %', 700, headerY + 5, { width: 80, align: 'right' });
        doc.moveDown(0.5);

        // Draw line below header
        doc.moveTo(50, doc.y).lineTo(750, doc.y).stroke();

        // Product Rows
        products.forEach(product => {
            const discount = discounts.find(d => d.productId.toString() === product._id.toString());

            // Add alternating row colors for readability
            const rowColor = doc.y % 2 === 0 ? '#f9f9f9' : '#ffffff';
            doc.rect(50, doc.y, 700, 30).fill(rowColor);

            // Write product details to each column in the table, wrap text if necessary
            doc.fontSize(10).fillColor('#000000')
                .text(product.name, 60, doc.y + 5, { continued: true, width: 160, align: 'left', lineBreak: true })
                .text(product.category, 220, doc.y + 5, { continued: true, width: 130, align: 'left', lineBreak: true })
                .text(product.price.toFixed(2), 370, doc.y + 5, { continued: true, width: 70, align: 'right', lineBreak: true })
                .text(product.material, 450, doc.y + 5, { continued: true, width: 120, align: 'left', lineBreak: true })
                .text(product.availability, 580, doc.y + 5, { continued: true, width: 100, align: 'center', lineBreak: true })
                .text(discount ? discount.discountPercentage + '%' : 'N/A', 700, doc.y + 5, { width: 80, align: 'right', lineBreak: true });

            doc.moveDown(1); // Add some space between rows

            // Draw a line between rows
            doc.moveTo(50, doc.y).lineTo(750, doc.y).strokeColor('#cccccc').stroke();
            doc.strokeColor('#000000'); // Reset for next lines
        });

        // Finalize document
        doc.end();

        // Send file after writing
        stream.on('finish', () => {
            console.log('PDF generated successfully');
            res.download(filePath);
        });

    } catch (err) {
        console.error('Error generating PDF:', err);
        res.status(500).json({ message: 'Failed to generate PDF report.' });
    }
}

module.exports = { generateProductPDFReport };