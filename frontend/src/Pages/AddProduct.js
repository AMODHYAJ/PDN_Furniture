import React, { useState } from "react";
import axios from "axios";
import './AddProduct.css';

const AddProduct = () => {
  const [productData, setProductData] = useState({
    name: "",
    category: "",
    price: "",
    material: "",
    availability: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!productData.name.trim()) {
      newErrors.name = "Product name is required.";
    } else if (productData.name.length < 3) {
      newErrors.name = "Product name must be at least 3 characters long.";
    }
    if (!productData.category.trim()) {
      newErrors.category = "Category is required.";
    }
    if (!productData.price) {
      newErrors.price = "Price is required.";
    } else if (isNaN(productData.price) || productData.price <= 0) {
      newErrors.price = "Price must be a positive number.";
    }
    if (!productData.material.trim()) {
      newErrors.material = "Material is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('name', productData.name);
      formData.append('category', productData.category);
      formData.append('price', productData.price);
      formData.append('material', productData.material);
      formData.append('availability', productData.availability);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.post("http://localhost:5000/products", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert("Product added successfully!");
      // Reset form
      setProductData({
        name: "",
        category: "",
        price: "",
        material: "",
        availability: true,
      });
      setImageFile(null);
      setErrors({});
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. " + (error.response?.data?.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add Product</h2>
      <form className="add-product-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" name="name" value={productData.name} onChange={handleInputChange} />
          {errors.name && <p className="error">{errors.name}</p>}
        </div>
        <div className="form-group">
          <label>Category:</label>
          <input type="text" name="category" value={productData.category} onChange={handleInputChange} />
          {errors.category && <p className="error">{errors.category}</p>}
        </div>
        <div className="form-group">
          <label>Price:</label>
          <input type="number" name="price" value={productData.price} onChange={handleInputChange} />
          {errors.price && <p className="error">{errors.price}</p>}
        </div>
        <div className="form-group">
          <label>Material:</label>
          <input type="text" name="material" value={productData.material} onChange={handleInputChange} />
          {errors.material && <p className="error">{errors.material}</p>}
        </div>
        <div className="form-group">
          <label>Product Image:</label>
          <input 
            type="file" 
            name="image" 
            onChange={handleImageChange}
            accept="image/*"
          />
          {errors.image && <p className="error">{errors.image}</p>}
        </div>
        <div className="form-group">
          <label>Availability:</label>
          <select name="availability" value={productData.availability} onChange={handleInputChange}>
            <option value={true}>In Stock</option>
            <option value={false}>Out of Stock</option>
          </select>
        </div>
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;