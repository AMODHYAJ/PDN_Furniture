import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './OngoingOrders.css';
import ProgressNavBar from "../Components/ProgressNavBar";
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet"></link>

const OngoingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/tasks/orders');
        setOrders(response.data.filter(order => 
          order.progress >= 0 && 
          order.progress < 100 && 
          order.customerApproval === "Approved"
        ));
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load ongoing orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      Loading orders...
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <span className="error-icon">⚠️</span>
      Error: {error}
    </div>
  );

  return (
    <>
      <ProgressNavBar />
      <div className="ongoing-orders-container">
        <div className="orders-header">
          <h1 className="orders-title">Ongoing Production</h1>
          <p className="orders-subtitle">Currently in manufacturing process</p>
        </div>
        
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛠️</div>
            <h3 className="empty-title">No Active Production</h3>
            <p className="empty-text">Currently there are no orders in production</p>
            <Link to="/new-order" className="new-order-btn">
              Create New Order
            </Link>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.orderId?.substring(0, 8) || 'N/A'}</h3>
                  <span className="estimated-time">
                    {order.totalEstimatedTime || 'N/A'} hours
                  </span>
                </div>
                
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${order.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-percent">{order.progress}%</span>
                </div>
                
                <div className="order-footer">
                  <Link
                    to={`/order/${order._id}`}
                    className="view-details-btn"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OngoingOrders;