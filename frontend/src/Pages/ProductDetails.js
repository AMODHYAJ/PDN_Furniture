import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "./ProductDetails.css";
import api from "../utils/api";
import { getProductImageUrl, handleImageError } from "../utils/imageUtils";

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/products/${id}`
        );
        setProduct(response.data.product);

        if (user) {
          checkWishlistStatus(user._id, id);
        }

        setError(null);
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("Failed to fetch product details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, user]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await axios.post("http://localhost:5000/cart", {
        userId: user._id,
        productId: id,
        quantity: quantity,
      });
      alert(`${quantity} ${product.name}(s) added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(
        error.response?.data?.error ||
          "Failed to add item to cart. Please try again."
      );
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      await axios.post("http://localhost:5000/cart", {
        userId: user._id,
        productId: id,
        quantity: quantity,
      });
      navigate("/checkout");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(
        error.response?.data?.error ||
          "Failed to proceed to checkout. Please try again."
      );
    }
  };

  const checkWishlistStatus = async (userId, productId) => {
    try {
      const response = await api.get(`/wishlists/user/${userId}`);
      const inWishlist = response.data.items?.some(
        (item) => item.productId && item.productId._id === productId
      );
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      setIsInWishlist(false);
    }
  };

  const handleWishlistAction = async () => {
    if (!user) {
        navigate("/login");
        return;
    }

    try {
        setWishlistLoading(true);
        if (isInWishlist) {
            await api.delete(`/wishlists/remove/${user._id}/${id}`);
            setIsInWishlist(false);
        } else {
            if (!product.availability) {
                const confirmAdd = window.confirm(
                    "This product is currently out of stock. Are you sure you want to add it to your wishlist?"
                );
                if (!confirmAdd) return;
            }
            
            await api.post("/wishlists/add", {
                userId: user._id,
                productId: id,
            });
            setIsInWishlist(true);
        }
    } catch (error) {
        console.error("Error updating wishlist:", error);
        alert(
            error.response?.data?.error ||
            "Failed to update wishlist. Please try again."
        );
    } finally {
        setWishlistLoading(false);
    }
};

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found-container">
        <h2>Product Not Found</h2>
        <p>
          The product you're looking for doesn't exist or may have been removed.
        </p>
        <button onClick={() => navigate("/products")} className="browse-button">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-container">
      <div className="product-details">
        <div className="product-image-container">
          <img
            src={getProductImageUrl(product.image)}
            alt={product.name}
            className="product-main-image"
            onError={handleImageError}
          />
        </div>
        <div className="product-info">
          <h1 className="product-title">{product.name}</h1>
          {product.brand && <p className="product-brand">By {product.brand}</p>}

          <div className="product-meta">
            <p>
              <strong>Category:</strong> {product.category}
            </p>
            {product.material && (
              <p>
                <strong>Material:</strong> {product.material}
              </p>
            )}
            <p
              className={`availability ${
                product.availability ? "in-stock" : "out-of-stock"
              }`}
            >
              {product.availability ? "In Stock" : "Out of Stock"}
            </p>
            {product.ratings && (
              <div className="product-ratings">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`star ${
                      i < Math.floor(product.ratings) ? "filled" : ""
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className="rating-count">
                  ({product.ratingCount || 0})
                </span>
              </div>
            )}
          </div>

          <div className="product-price-container">
            {product.originalPrice && (
              <span className="original-price">
                Rs. {product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="product-price">
              Rs. {product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="discount-percentage">
                ({Math.round((1 - product.price / product.originalPrice) * 100)}
                % OFF)
              </span>
            )}
          </div>

          {product.description && (
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {product.availability && (
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <div className="quantity-controls">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max="10"
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(10, value)));
                  }}
                />
                <button
                  onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
            </div>
          )}

          <div className="action-buttons">
            {product.availability ? (
              <>
                <button className="add-to-cart" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button className="buy-now" onClick={handleBuyNow}>
                  Buy Now
                </button>
              </>
            ) : (
              <button 
                className="notify-me"
                onClick={() => alert("We'll notify you when this product is back in stock!")}
              >
                Notify When Available
              </button>
            )}
            <button
              className={`wishlist-button ${isInWishlist ? "in-wishlist" : ""}`}
              onClick={handleWishlistAction}
              disabled={wishlistLoading}
            >
              {wishlistLoading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  {isInWishlist ? (
                    <span>✓ In Wishlist</span>
                  ) : (
                    <span>♡ Add to Wishlist</span>
                  )}
                </>
              )}
            </button>
            <button className="back-button" onClick={() => navigate(-1)}>
              ← Back to Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;