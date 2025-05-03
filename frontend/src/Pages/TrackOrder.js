import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import api from '../utils/api';
import './TrackOrder.css';

const TrackOrder = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [trackingUpdates, setTrackingUpdates] = useState([]);
  const [estimatedDelivery, setEstimatedDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackingInfo = async () => {
      try {
        const response = await api.get(`/orders/${orderId}/tracking`);
        setOrder(response.data.order);
        setTrackingUpdates(response.data.trackingUpdates || []);
        setEstimatedDelivery(response.data.estimatedDelivery);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tracking information');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTrackingInfo();
    } else {
      navigate('/login');
    }
  }, [orderId, user, navigate]);

  const getStatusBadge = (status) => {
    const statusClasses = {
      processing: 'badge-processing',
      shipped: 'badge-shipped',
      delivered: 'badge-delivered',
      in_transit: 'badge-transit',
      cancelled: 'badge-cancelled'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'badge-default'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) return <div className="loading">Loading tracking information...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!order) return <div className="error">Order not found</div>;

  return (
    <div className="track-order-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Back to Order
      </button>
      
      <div className="tracking-header">
        <h1>Track Your Order</h1>
        <div className="order-meta">
          <span>Order #{order._id.substring(0, 8).toUpperCase()}</span>
          {getStatusBadge(order.status)}
        </div>
      </div>
      
      {order.status === 'processing' || order.status === 'pending' ? (
        <div className="order-preparation">
          <h2>Your order is being prepared</h2>
          <p>We're getting your order ready for shipment. Tracking information will be available once your order has been shipped.</p>
          <p>Current status: <strong>{order.status}</strong></p>
        </div>
      ) : (
        <>
          <div className="tracking-info-card">
            <h2>Shipping Information</h2>
            <div className="tracking-meta">
              {order.trackingNumber && (
                <p>
                  <strong>Tracking Number:</strong> {order.trackingNumber}
                </p>
              )}
              {estimatedDelivery && (
                <p>
                  <strong>Estimated Delivery:</strong> {new Date(estimatedDelivery).toLocaleDateString()}
                </p>
              )}
              <p>
                <strong>Shipping to:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>

          <div className="timeline-container">
            <h2>Order Progress</h2>
            <div className="timeline">
              {trackingUpdates.map((update, index) => (
                <div 
                  key={index} 
                  className={`timeline-step ${index === 0 ? 'first' : ''} ${index === trackingUpdates.length - 1 ? 'last' : ''}`}
                >
                  <div className="timeline-marker">
                    <div className="marker-dot"></div>
                    {index < trackingUpdates.length - 1 && (
                      <div className="marker-line"></div>
                    )}
                  </div>
                  <div className="timeline-content">
                    <h4>{update.description}</h4>
                    <div className="timeline-meta">
                      <span className="location">{update.location}</span>
                      <span className="date">
                        {new Date(update.date).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {getStatusBadge(update.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.status === 'delivered' && (
            <div className="delivery-confirmation">
              <h3>Delivery Confirmed</h3>
              <p>Your order was delivered on {new Date(order.deliveredAt).toLocaleDateString()}.</p>
              <button 
                className="view-order-btn"
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                View Order Details
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrackOrder;