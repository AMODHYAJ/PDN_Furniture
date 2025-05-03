import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './ProductCatalog.css';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/products");
      setProducts(response.data.products || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError("Failed to fetch products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search query and category filter
  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter ? 
        product.category.toLowerCase() === categoryFilter.toLowerCase() : true;
      return matchesSearch && matchesCategory;
    });
    setFilteredProducts(filtered);
  }, [searchQuery, categoryFilter, products]);

  // Fetch products when the component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-catalog-container">
      <h1>Product Catalog</h1>

      {/* Search and Filter Controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search Products"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-dropdown"
        >
          <option value="">All Categories</option>
          <option value="Furniture">Furniture</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Home Decor">Home Decor</option>
        </select>
      </div>

      {/* Display Filtered Products */}
      <div className="product-list">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image-container">
                <img 
                  src={
                    product.image 
                      ? `http://localhost:5000${product.image}` 
                      : '/images/placeholder-product.jpg'
                  } 
                  alt={product.name} 
                  className="product-image"
                  onError={(e) => {
                    e.target.src = '/images/placeholder-product.jpg';
                  }}
                />
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-price">Rs. {product.price.toFixed(2)}</p>
                <p className={`availability ${product.availability ? 'in-stock' : 'out-of-stock'}`}>
                  {product.availability ? 'In Stock' : 'Out of Stock'}
                </p>
                <p className="product-material">Material: {product.material}</p>
                <Link to={`/products/${product._id}`} className="view-details">
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            No products found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;