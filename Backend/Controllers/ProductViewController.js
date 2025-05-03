const ProductViewCount = require('../Model/ProductViewCountModel');

// Controller to track product view count
exports.trackProductView = async (req, res) => {
  const productId = req.params.id;

  try {
    // Check if the product view record exists for the given productId
    let productView = await ProductViewCount.findOne({ productID: productId });

    if (productView) {
      // If the record exists, increment the view count
      productView.viewCount += 1;
      await productView.save();  // Save the updated record
    } else {
      // If no record exists, create a new record with viewCount = 1
      productView = new ProductViewCount({
        productID: productId,
        viewCount: 1
      });
      await productView.save();  // Save the new record
    }

    // Return the updated view count
    res.json({ message: 'Product view updated', viewCount: productView.viewCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

//  get the current product view count
exports.getProductViewCount = async (req, res) => {
  const productId = req.params.id;

  try {
    // Find the product view record
    const productView = await ProductViewCount.findOne({ productID: productId });

    if (productView) {
      // If the record exists, return the view count
      res.json({ viewCount: productView.viewCount });
    } else {
      // If no view record exists, return view count as 0
      res.json({ viewCount: 0 });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};