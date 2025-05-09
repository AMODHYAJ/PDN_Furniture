import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import api from "../utils/api";
import { getProductImageUrl, handleImageError } from "../utils/imageUtils";
import "./Checkout.css";

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "cashOnDelivery",
  });

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get(`/cart/${user._id}`);
        setCart(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCart();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const orderItems = cart.items.map((item) => ({
        product: item.productId._id,
        quantity: item.quantity,
      }));

      const orderData = {
        items: orderItems,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        paymentMethod: formData.paymentMethod,
      };

      const response = await api.post("/orders", orderData);
      await api.delete(`/cart/${user._id}/clear`);
      navigate(`/order-confirmation/${response.data.order._id}`);
    } catch (error) {
      setError(error.response?.data?.message || "Checkout failed");
    }
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
    </div>
  );
  
  if (error) return <div className="error-message">{error}</div>;
  
  if (!cart || cart.items.length === 0) {
    return (
      <div className="empty-cart">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate("/products")}>Continue Shopping</button>
      </div>
    );
  }

  const totalPrice = cart.items.reduce(
    (sum, item) => sum + item.productId.price * item.quantity,
    0
  );

  return (
    <div className="checkout-container">
      <div className="checkout-form">
        <h2>Shipping Information</h2>
        <form onSubmit={handleSubmit}>
          <div className="checkout-form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="checkout-form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="checkout-form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="checkout-form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="checkout-form-group">
            <label>Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="checkout-form-group">
            <h3>Payment Method</h3>
            <div className="checkout-payment-method">
              <input
                type="radio"
                id="cashOnDelivery"
                name="paymentMethod"
                value="cashOnDelivery"
                checked={formData.paymentMethod === "cashOnDelivery"}
                onChange={handleInputChange}
              />
              <label htmlFor="cashOnDelivery" className="checkout-payment-method-label">
                <span className="checkout-payment-icon">💵</span>
                Cash on Delivery
              </label>
            </div>
          </div>

          <button type="submit" className="place-order-btn">
            Place Order
          </button>
        </form>
      </div>

      <div className="checkout-order-summary">
        <h2>Order Summary</h2>
        <div className="checkout-order-items">
          {cart.items.map((item) => (
            <div key={item.productId._id} className="checkout-order-item">
              <img
                src={getProductImageUrl(item.productId?.image)}
                alt={item.productId?.name || "Product"}
                onError={handleImageError}
                className="checkout-order-item-image"
                style={{
                  maxWidth: '100px',
                  maxHeight: '100px',
                  width: 'auto',
                  height: 'auto'
                }}
              />
              <div className="checkout-order-item-details">
                <h4>{item.productId.name}</h4>
                <p>
                  Rs. {item.productId.price} × {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="checkout-order-totals">
          <div className="checkout-total-row final">
            <span>Total</span>
            <span>Rs. {totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;