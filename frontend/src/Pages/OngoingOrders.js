import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './OngoingOrders.css';
import ProgressNavBar from "../Components/ProgressNavBar";

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
    <div className="luxury-loading">
      <div className="luxury-spinner"></div>
      Loading orders...
    </div>
  );
  
  if (error) return (
    <div className="luxury-error-message">
      <span className="luxury-error-icon">⚠️</span>
      Error: {error}
    </div>
  );

  return (
    <>
      <ProgressNavBar />
      <div className="luxury-ongoing-orders">
        <div className="luxury-header">
          <h1 className="luxury-title">Ongoing Production</h1>
          <div className="luxury-divider"></div>
        </div>
        
        {orders.length === 0 ? (
          <div className="luxury-empty-state">
            <div className="luxury-empty-icon">🛠️</div>
            <h3>No Active Production</h3>
            <p>Currently there are no orders in production</p>
            <Link to="/new-order" className="luxury-new-order-btn">
              Create New Order
            </Link>
          </div>
        ) : (
          <div className="luxury-orders-grid">
            {orders.map(order => (
              <div key={order._id} className="luxury-order-card">
                <div className="luxury-order-header">
                  <h3>Order #{order.orderId?.substring(0, 8) || 'N/A'}</h3>
                  <span className="luxury-estimated-time">
                    {order.totalEstimatedTime || 'N/A'} hours
                  </span>
                </div>
                
                <div className="luxury-progress-container">
                  <div className="luxury-progress-bar">
                    <div 
                      className="luxury-progress-fill"
                      style={{ width: `${order.progress}%` }}
                    ></div>
                  </div>
                  <span className="luxury-progress-percent">{order.progress}%</span>
                </div>
                
                <div className="luxury-order-footer">
                  <Link
                    to={`/order/${order._id}`}
                    className="luxury-view-details-btn"
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