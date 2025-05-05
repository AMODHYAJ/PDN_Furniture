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

  if (loading) return <div className="loading-spinner">Loading orders...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <>
      <ProgressNavBar />
      <div className="ongoing-orders-container">
        <h2>Ongoing Orders</h2>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No ongoing orders found</p>
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
                    className="view-progress-button"
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