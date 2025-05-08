import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import deleteProduct from "./DeleteProduct";
import "./AdminProduct.css";
import "./AddProduct.css";
import "./EditProduct.css";
import Header from "./Header";
//import Footer from "./Footer";

const AdminProduct = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const navigate = useNavigate();
  const [viewCounts, setViewCounts] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productResponse = await axios.get("http://localhost:5000/products");
      setProducts(productResponse.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      fetchViewCounts(products);
    }
  }, [products]);

  const fetchViewCounts = async (productList) => {
    for (let product of productList) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/product/viewcount/${product._id}`
        );
        setViewCounts((prev) => ({
          ...prev,
          [product._id]: response.data.viewCount,
        }));
      } catch (error) {
        console.error("Error fetching view count:", error);
      }
    }
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleCategoryFilter = (e) => setCategoryFilter(e.target.value);
  const handleAvailabilityFilter = (e) => setAvailabilityFilter(e.target.value);

  const filteredProducts = products.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (categoryFilter === "All" ||
        product.category?.toLowerCase() === categoryFilter.toLowerCase()) &&
      (availabilityFilter === "All" ||
        (availabilityFilter === "Available" && product.availability) ||
        (availabilityFilter === "Not Available" && !product.availability))
    );
  });

  const toggleAvailability = async (productId, newAvailability) => {
    try {
      await axios.put(`http://localhost:5000/products/${productId}`, {
        availability: newAvailability,
      });
      setProducts(
        products.map((product) =>
          product._id === productId
            ? { ...product, availability: newAvailability }
            : product
        )
      );
    } catch (error) {
      console.error("Error toggling product availability:", error);
    }
  };

  const handleFileUpload = (e) => {
    setUploadStatus("");
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    uploadProducts(uploadedFile);
  };

  const uploadProducts = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post("http://localhost:5000/products/bulk-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadStatus("Upload successful!");
      fetchProducts();
    } catch (error) {
      setUploadStatus("Error uploading products.");
      console.error("Error uploading products:", error);
    }
  };

  const exportToExcel = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/products/export",
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const generateProductReport = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/reports/generate-report",
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ProductReport.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error(
        "Error generating the PDF report:",
        error.response || error.message
      );
      alert("Failed to generate product report");
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      <h2>Product Catalog</h2>

      <div className="upload-container">
        <label htmlFor="file-upload">
          Click to upload products in a bulk (.xlsx or .xls)
        </label>
        <input
          type="file"
          id="file-upload"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />
        {uploadStatus && (
          <p
            className={`upload-status ${
              uploadStatus.includes("Error") ? "error" : ""
            }`}
          >
            {uploadStatus}
          </p>
        )}
      </div>

      <div className="export-file-button">
        <button className="export-button" onClick={exportToExcel}>
          Export to Excel
        </button>
        <button className="generateReportBtn" onClick={generateProductReport}>
          Generate Product Report (PDF)
        </button>
      </div>

      <div className="search-filter-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <select
          value={categoryFilter}
          onChange={handleCategoryFilter}
          className="filter-dropdown"
        >
          <option value="All">All Categories</option>
          <option value="living room">Living Room</option>
          <option value="dining room">Dining room</option>
          <option value="bedroom">Bedroom</option>
        </select>
        <select
          value={availabilityFilter}
          onChange={handleAvailabilityFilter}
          className="filter-dropdown"
        >
          <option value="All">All Availability</option>
          <option value="Available">Available for Customization</option>
          <option value="Not Available">Not Available</option>
        </select>
      </div>

      <div className="product-list">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <Link
                to={`/view-product/${product._id}`}
                className="product-link"
              >
                <div className="product-card-content">
                  <img
                    src={
                      product.image
                        ? `http://localhost:5000${product.image}`
                        : "/images/placeholder-product.jpg"
                    }
                    alt={product.name}
                    className="product-image"
                    width="150"
                    onError={(e) => {
                      e.target.src = "/images/placeholder-product.jpg";
                    }}
                  />
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p>Category: {product.category}</p>
                    <p>
                      Weekly Usage: {product.weeklyUsageEstimate || 2} units
                    </p>
                    <p
                      className={
                        product.availability
                          ? "available-for-customization"
                          : "not-available"
                      }
                    >
                      {product.availability
                        ? "Available for Customization"
                        : "Not Available"}
                    </p>
                  </div>
                </div>
              </Link>

              <div className="product-actions">
                <button
                  onClick={() =>
                    toggleAvailability(product._id, !product.availability)
                  }
                  className={`availability-button ${
                    product.availability ? "available" : "not-available"
                  }`}
                >
                  {product.availability
                    ? "Set as Not Available"
                    : "Set as Available"}
                </button>

                <button
                  onClick={() => navigate(`/edit-product/${product._id}`)}
                  className="update-button"
                >
                  Update
                </button>

                <button
                  onClick={() => deleteProduct(product._id, setProducts)}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-products-message">No products available</p>
        )}
      </div>

      {/*<Footer />*/}
    </div>
  );
};

export default AdminProduct;
