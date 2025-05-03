const PDFDocument = require('pdfkit');
const fs = require('fs');
const InventoryModel = require('../Model/InventoryModel');

async function generateInventoryPDFReport(req, res) {
    try {
        const inventories = await InventoryModel.find();

        const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
        const filePath = './uploads/InventoryReport.pdf';
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Title
        doc.fontSize(24).fillColor('#2196F3').text('Inventory Report', { align: 'center' });
        doc.moveDown(1);

        // Table Header
        const headerY = doc.y;
        doc.rect(50, headerY, 750, 30).fill('#2196F3');
        doc.fontSize(12).fillColor('#ffffff')
            .text('Material Name', 60, headerY + 5, { continued: true, width: 160 })
            .text('Quantity', 220, headerY + 5, { continued: true, width: 100, align: 'right' })
            .text('Unit', 330, headerY + 5, { continued: true, width: 80 })
            .text('Wastage Qty', 420, headerY + 5, { continued: true, width: 100, align: 'right' })
            .text('Availability', 530, headerY + 5, { continued: true, width: 120, align: 'center' })
            .text('Last Updated', 660, headerY + 5, { width: 130, align: 'left' });
        doc.moveDown(0.5);
        doc.moveTo(50, doc.y).lineTo(800, doc.y).stroke();

        // Inventory Rows
        inventories.forEach(item => {
            const rowColor = doc.y % 2 === 0 ? '#f0f0f0' : '#ffffff';
            doc.rect(50, doc.y, 750, 30).fill(rowColor);

            doc.fontSize(10).fillColor('#000000')
                .text(item.materialName, 60, doc.y + 5, { continued: true, width: 160 })
                .text(item.quantity.toFixed(2), 220, doc.y + 5, { continued: true, width: 100, align: 'right' })
                .text(item.unit, 330, doc.y + 5, { continued: true, width: 80 })
                .text(item.wastageQuantity.toFixed(2), 420, doc.y + 5, { continued: true, width: 100, align: 'right' })
                .text(item.availability ? 'Yes' : 'No', 530, doc.y + 5, { continued: true, width: 120, align: 'center' })
                .text(new Date(item.lastUpdated).toLocaleString(), 660, doc.y + 5, { width: 130 });
            
            doc.moveDown(1);
            doc.moveTo(50, doc.y).lineTo(800, doc.y).strokeColor('#cccccc').stroke();
            doc.strokeColor('#000000');
        });

        doc.end();

        stream.on('finish', () => {
            res.download(filePath);
        });

    } catch (err) {
        console.error('Error generating Inventory PDF:', err);
        res.status(500).json({ message: 'Failed to generate inventory report.' });
    }
}

module.exports = { generateInventoryPDFReport };
