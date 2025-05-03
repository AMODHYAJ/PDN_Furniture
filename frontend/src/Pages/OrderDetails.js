import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import api from "../utils/api";
import { getProductImageUrl, handleImageError } from "../utils/imageUtils";
import "./OrderDetails.css";

const OrderDetails = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data.order);

        // Calculate time left for cancellation if order is processing
        if (response.data.order.status === "processing") {
          const processingStart = new Date(response.data.order.createdAt);
          const deadline = new Date(
            processingStart.getTime() + 24 * 60 * 60 * 1000
          );
          updateTimeLeft(deadline);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrder();
    } else {
      navigate("/login");
    }
  }, [orderId, user, navigate]);

  const updateTimeLeft = (deadline) => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = deadline - now;

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft("Cancellation window expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleCancelOrder = async () => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`);
      setOrder(response.data.order);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      processing: "badge-processing",
      shipped: "badge-shipped",
      delivered: "badge-delivered",
      cancelled: "badge-cancelled",
    };

    return <span className={`badge ${statusClasses[status]}`}>{status}</span>;
  };

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="error">Order not found</div>;

  return (
    <div className="order-details-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Back to Orders
      </button>

      <div className="order-header">
        <h1>Order #{order._id.substring(0, 8)}</h1>
        <div className="order-status">
          {getStatusBadge(order.status)}
          <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="order-sections">
        <div className="order-items-section">
          <h2>Order Items</h2>
          <div className="order-items">
            {order.items.map((item) => (
              <div key={item._id || item.productId._id} className="order-item">
                <img
                  src={getProductImageUrl(item.productId.image)}
                  alt={item.productId.name}
                  className="product-image"
                  onError={handleImageError}
                />
                <div className="item-details">
                  <h4>{item.productId.name}</h4>
                  <div className="item-meta">
                    <span>Quantity: {item.quantity}</span>
                    <span>Price: Rs. {item.price.toFixed(2)}</span>
                    <span>
                      Total: Rs. {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Rs. {order.totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Rs. 0.00</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>Rs. {order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="order-info-section">
          <div className="shipping-info">
            <h2>Shipping Information</h2>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{user.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Address:</span>
                <span className="info-value">
                  {order.shippingAddress.address}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">City:</span>
                <span className="info-value">{order.shippingAddress.city}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Postal Code:</span>
                <span className="info-value">
                  {order.shippingAddress.postalCode}
                </span>
              </div>
            </div>
          </div>

          <div className="payment-info">
            <h2>Payment Information</h2>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Method:</span>
                <span className="info-value">
                  {order.paymentMethod === "cashOnDelivery"
                    ? "Cash on Delivery"
                    : "Credit/Debit Card"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span className="info-value">
                  {order.status === "delivered" &&
                  order.paymentMethod === "cashOnDelivery"
                    ? "Paid"
                    : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {order.status === "processing" &&
        timeLeft &&
        timeLeft !== "Cancellation window expired" && (
          <div className="action-section">
            <div className="cancellation-notice">
              <h3>You can cancel this order within 24 hours of placement</h3>
              <p>Time remaining: {timeLeft}</p>
              <button className="cancel-button" onClick={handleCancelOrder}>
                Cancel Order
              </button>
            </div>
          </div>
        )}

      {order.status === "shipped" && (
        <div className="action-section">
          <div className="tracking-info">
            <h3>Your order is on the way</h3>
            <p>
              Expected delivery date:{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <button
              className="track-button"
              onClick={() => navigate(`/orders/${order._id}/tracking`)}
            >
              Track Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
