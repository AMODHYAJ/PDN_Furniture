import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import api from "../utils/api";
import { getProductImageUrl, handleImageError } from "../utils/imageUtils";
import "./OrderConfirmation.css";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        
        if (!response?.data) {
          throw new Error("No order data received from server");
        }

        // Skip userId check if not available in response
        if (response.data.order?.userId && user?._id) {
          if (String(response.data.order.userId) !== String(user._id)) {
            navigate('/');
            return;
          }
        }
        
        setOrder(response.data.order || response.data);
      } catch (err) {
        console.error("Order fetch error:", err);
        setError(err.response?.data?.message || 
               err.message || 
               'Failed to load order details');
        
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    } else {
      setError("Missing order ID");
      setLoading(false);
    }
  }, [orderId, user, navigate]);

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="error">Order not found</div>;

  return (
    <div className="order-confirmation">
      <div className="confirmation-header">
        <h1>Order Confirmation</h1>
        <p>Thank you for your order!</p>
        <p>Your order number is: <strong>#{order._id}</strong></p>
      </div>
      
      <div className="order-details">
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  <img
                    src={getProductImageUrl(item.productId?.image)}
                    alt={item.productId?.name || "Product"}
                    onError={handleImageError}
                    loading="lazy"
                    crossOrigin="anonymous"
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <div className="item-details">
                  <h4>{item.productId.name}</h4>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: Rs. {item.price.toFixed(2)}</p>
                  <p>Total: Rs. {(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="order-total">
            <h3>Total: Rs. {order.totalPrice.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="shipping-details">
          <h2>Shipping Details</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Address:</strong> {order.shippingAddress.address}</p>
          <p><strong>City:</strong> {order.shippingAddress.city}</p>
          <p><strong>Postal Code:</strong> {order.shippingAddress.postalCode}</p>
          <p><strong>Payment Method:</strong> Cash on Delivery</p>
        </div>
      </div>
      
      <div className="next-steps">
        <h2>What's Next?</h2>
        <p>You'll receive an email confirmation shortly.</p>
        <button className="continue-shopping" onClick={() => navigate('/products')}>
          <span>Continue Shopping</span>
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;