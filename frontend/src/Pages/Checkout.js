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
      // Transform cart items to match backend expectations
      const orderItems = cart.items.map((item) => ({
        product: item.productId._id, // Send just the product ID
        quantity: item.quantity,
      }));

      const orderData = {
        items: orderItems, // Use transformed items
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        // paymentMethod is automatically set to 'cashOnDelivery' by backend
      };

      const response = await api.post("/orders", orderData);
      await api.delete(`/cart/${user._id}/clear`);
      navigate(`/order-confirmation/${response.data.order._id}`);
    } catch (error) {
      setError(error.response?.data?.message || "Checkout failed");
    }
  };

  if (loading) return <div className="loading">Loading checkout...</div>;
  if (error) return <div className="error">{error}</div>;
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
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <h3>Payment Method</h3>
            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="cashOnDelivery"
                checked={formData.paymentMethod === "cashOnDelivery"}
                onChange={handleInputChange}
              />
              Cash on Delivery
            </label>
          </div>

          <button type="submit" className="place-order-btn">
            Place Order
          </button>
        </form>
      </div>

      <div className="order-summary">
        <h2>Order Summary</h2>
        <div className="order-items">
          {cart.items.map((item) => (
            <div key={item.productId._id} className="order-item">
              <img
                src={getProductImageUrl(item.productId?.image)}
                alt={item.productId?.name || "Product"}
                onError={handleImageError}
                className="cart-item-image"
              />
              <div>
                <h4>{item.productId.name}</h4>
                <p>
                  Rs. {item.productId.price} × {item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="order-total">
          <h3>Total: Rs. {totalPrice.toFixed(2)}</h3>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
