// routes/discountRoutes.js
const express = require('express');
const { getDiscountForProduct, getAllDiscounts } = require('../Controllers/DiscountController');
const Discount = require('../Model/DiscountModel');
const router = express.Router();

// 1. Get active discount for a product
router.get('/product/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const discountPercentage = await getDiscountForProduct(productId);
    res.status(200).json({ discountPercentage });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discount for product', error });
  }
});

// 2. Create a new discount
router.post('/create', async (req, res) => {
  const { productId, discountPercentage, startDate, endDate } = req.body;

  try {
    const newDiscount = new Discount({
      productId,
      discountPercentage,
      startDate,
      endDate,
    });

    await newDiscount.save();
    res.status(201).json({ message: 'Discount created successfully', newDiscount });
  } catch (error) {
    res.status(500).json({ message: 'Error creating discount', error });
  }
});

// 3. Update an existing discount
router.put('/update/:discountId', async (req, res) => {
  const { discountId } = req.params;
  const { discountPercentage, startDate, endDate, active } = req.body;

  try {
    const updatedDiscount = await Discount.findByIdAndUpdate(
      discountId,
      { discountPercentage, startDate, endDate, active },
      { new: true }
    );
    res.status(200).json({ message: 'Discount updated successfully', updatedDiscount });
  } catch (error) {
    res.status(500).json({ message: 'Error updating discount', error });
  }
});

// 4. Remove a discount
router.delete('/delete/:discountId', async (req, res) => {
  const { discountId } = req.params;

  try {
    await Discount.findByIdAndDelete(discountId);
    res.status(200).json({ message: 'Discount removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing discount', error });
  }
});

// 5. Get all discounts
router.get('/', async (req, res) => {
  try {
    const discounts = await getAllDiscounts();
    res.status(200).json(discounts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching discounts', error });
  }
});

module.exports = router;