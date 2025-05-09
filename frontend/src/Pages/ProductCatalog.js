import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ProductCatalog.css";

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
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter
        ? product.category.toLowerCase() === categoryFilter.toLowerCase()
        : true;
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
      <div className="product-catalog-controls">
        <input
          type="text"
          placeholder="Search Products"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="product-catalog-search-input"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="product-catalog-filter-dropdown"
        >
          <option value="">All Categories</option>
          <option value="living room">Living Room</option>
          <option value="dining room">Dining room</option>
          <option value="bedroom">Bedroom</option>
        </select>
      </div>

      {/* Display Filtered Products */}
      <div className="product-catalog-product-list">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product._id} className="product-catalog-product-card">
              <div className="product-catalog-product-image-container">
                <img
                  src={
                    product.image
                      ? `http://localhost:5000${product.image}`
                      : "/images/placeholder-product.jpg"
                  }
                  alt={product.name}
                  className="product-catalog-product-image"
                  onError={(e) => {
                    e.target.src = "/images/placeholder-product.jpg";
                  }}
                />
              </div>
              <div className="product-catalog-product-info">
                <h3 className="product-catalog-product-name">{product.name}</h3>
                <p className="product-catalog-product-category">{product.category}</p>
                <p className="product-catalog-product-price">Rs. {product.price.toFixed(2)}</p>
                <p
                  className={`product-catalog-availability ${
                    product.availability ? "in-stock" : "out-of-stock"
                  }`}
                >
                  {product.availability ? "In Stock" : "Out of Stock"}
                </p>
                <p className="product-catalog-product-material">Material: {product.material}</p>

                <Link to={`/products/${product._id}`} className="product-catalog-view-details">
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="product-catalog-no-products">
            No products found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;
