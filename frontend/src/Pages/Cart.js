import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getProductImageUrl, handleImageError } from "../utils/imageUtils";
import "./Cart.css";

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 5000,
  withCredentials: true
});

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState({ items: [], totalPrice: 0, totalQuantity: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      if (!user?._id) {
        setCart({ items: [], totalPrice: 0, totalQuantity: 0 });
        return;
      }

      setLoading(true);
      setError(null);
      
      const response = await api.get(`/cart/${user._id}`, {
        params: { t: Date.now() } // Cache busting
      });
      
      // Filter out items with null product references
      const validItems = response.data?.items?.filter(item => item?.productId) || [];
      
      setCart({
        items: validItems,
        totalPrice: validItems.reduce((sum, item) => sum + (item.productId.price * item.quantity), 0),
        totalQuantity: validItems.reduce((sum, item) => sum + item.quantity, 0)
      });
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Failed to load cart. Please refresh the page.");
      setCart({ items: [], totalPrice: 0, totalQuantity: 0 });
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchCart();
  }, [user, navigate, fetchCart]);

  // Refresh cart when location changes
  useEffect(() => {
    fetchCart();
  }, [location.key, fetchCart]);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await api.put(`/cart/${user._id}/${productId}`, {
        quantity: Math.max(1, newQuantity),
      });
      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert(error.response?.data?.error || "Failed to update quantity");
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/${user._id}/${productId}`);
      await fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      alert(error.response?.data?.error || "Failed to remove item");
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;
    
    try {
      const response = await api.delete(`/cart/${user._id}/clear`);
      
      // Use the response data to update the state
      if (response.data.success) {
        setCart({
          items: [],
          totalPrice: 0,
          totalQuantity: 0
        });
      } else {
        await fetchCart(); // Fallback to refetch if something went wrong
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      alert(error.response?.data?.error || "Failed to clear cart");
      await fetchCart(); // Ensure we're showing the current state
    }
};

  if (loading) return <div className="cart-loading">Loading your cart...</div>;
  if (error) return <div className="cart-error">{error}</div>;
  
  const isEmpty = !cart?.items || cart.items.length === 0;
  const calculatedTotal = isEmpty ? 0 : cart.items.reduce(
    (sum, item) => sum + (item?.productId?.price || 0) * item.quantity,
    0
  );

  if (isEmpty) {
    return (
      <div className="empty-cart">
        <h2>Your Cart is Empty</h2>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <Link to="/products" className="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Your Shopping Cart</h2>

      <div className="cart-items">
        {cart.items.map((item) => (
          <div key={item.productId._id} className="cart-item">
            <div className="cart-item-image-container">
              <img
                src={getProductImageUrl(item.productId?.image)}
                alt={item.productId?.name || "Product"}
                onError={handleImageError}
                className="cart-item-image"
                loading="lazy"
              />
            </div>

            <div className="cart-item-details">
              <h3>
                <Link to={`/products/${item.productId._id}`}>
                  {item.productId?.name || "Unknown Product"}
                </Link>
              </h3>
              <p>Price: Rs. {(item.productId?.price || 0).toFixed(2)}</p>

              <div className="cart-quantity-control">
                <button
                  onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <p className="cart-item-total">
                Total: Rs. {((item.productId?.price || 0) * item.quantity).toFixed(2)}
              </p>

              <button
                onClick={() => removeItem(item.productId._id)}
                className="cart-remove-item"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <h3>Order Summary</h3>
        <div className="cart-summary-row">
          <span>Subtotal ({cart.totalQuantity} items):</span>
          <span>Rs. {calculatedTotal.toFixed(2)}</span>
        </div>
        <div className="cart-summary-row">
          <span>Shipping:</span>
          <span>Free</span>
        </div>
        <div className="cart-summary-row total">
          <span>Total:</span>
          <span>Rs. {calculatedTotal.toFixed(2)}</span>
        </div>

        <div className="cart-actions">
          <button onClick={clearCart} className="clear-cart">
            Clear Cart
          </button>
          <Link to="/checkout" className="checkout-button">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;