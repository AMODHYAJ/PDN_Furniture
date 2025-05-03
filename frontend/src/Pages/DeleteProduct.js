// DeleteProduct.js

import axios from "axios";

// Function to delete a product by its ID
const deleteProduct = async (id, setProducts) => {
  const isConfirmed = window.confirm("Are you sure you want to delete this product?");
  
  if (isConfirmed) {
    try {
      await axios.delete(`http://localhost:5000/products/${id}`);
      setProducts(prevProducts => prevProducts.filter(product => product._id !== id));  // Update state after deletion
      alert("Product deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("An error occurred while deleting the product.");
    }
  }
};

export default deleteProduct;