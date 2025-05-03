// controllers/DiscountController.js
const Discount = require('../Model/DiscountModel');

// Function to get the discount for a product
const getDiscountForProduct = async (productId) => {
  try {
    const discount = await Discount.findOne({
      productId: productId,
      active: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (discount) {
      return discount.discountPercentage;  // Return discount percentage if active
    } else {
      return 0;  // No discount
    }
  } catch (error) {
    console.error('Error fetching discount:', error);
    return 0;  // Return no discount if error occurs
  }
};

// Function to get all discounts
const getAllDiscounts = async () => {
  try {
    const discounts = await Discount.find(); // Fetch all discounts
    return discounts;
  } catch (error) {
    console.error('Error fetching all discounts:', error);
    return [];  // Return an empty array if error occurs
  }
};

module.exports = { getDiscountForProduct, getAllDiscounts };