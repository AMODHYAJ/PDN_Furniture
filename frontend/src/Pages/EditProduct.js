import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import './EditProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const [productData, setProductData] = useState({
    name: "",
    category: "",
    price: "",
    material: "",
    availability: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/products/${id}`);
        if (response.data.product) {
          setProductData(response.data.product);
          if (response.data.product.image) {
            setPreviewImage(`http://localhost:5000/images/products/${response.data.product.image}`);
          }
        }
      } catch (error) {
        console.log("Error fetching product:", error);
        alert("Error fetching product data");
      }
    };
    fetchProduct();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData({
      ...productData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      const response = await axios.put(
        `http://localhost:5000/products/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      alert("Product updated successfully!");
      navigate("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product. " + (error.response?.data?.message || ""));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="edit-product-container">
      <h2>Edit Product</h2>
      <form className="edit-product-form" onSubmit={handleSubmit}>
        {previewImage && (
          <div className="image-preview">
            <img src={previewImage} alt="Product Preview" width="200" />
          </div>
        )}
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={productData.name || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Category:</label>
          <input
            type="text"
            name="category"
            value={productData.category || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Price:</label>
          <input
            type="number"
            name="price"
            value={productData.price || ''}
            onChange={handleInputChange}
            required
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Material:</label>
          <input
            type="text"
            name="material"
            value={productData.material || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Product Image:</label>
          <input
            type="file"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>
        <div className="form-group">
          <label>Availability:</label>
          <select
            name="availability"
            value={productData.availability}
            onChange={handleInputChange}
            required
          >
            <option value={true}>In Stock</option>
            <option value={false}>Out of Stock</option>
          </select>
        </div>
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
};

export default EditProduct;