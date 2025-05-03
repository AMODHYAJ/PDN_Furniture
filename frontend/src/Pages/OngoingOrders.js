// src/components/OngoingOrders.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api'; // Use your configured axios instance
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
        
        // Use the api instance instead of axios directly
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
  

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <ProgressNavBar />
      <div className="ongoing-orders-container">
        <h2>Ongoing Orders</h2>
        
        {orders.length === 0 ? (
          <p>No ongoing orders found</p>
        ) : (
          <ul className="orders-list">
            {orders.map(order => (
              <li key={order._id} className="order-item">
                <div className="order-details">
                  <p><strong>Order ID:</strong> {order.orderId}</p>
                  <p><strong>Total Estimated Time:</strong> {order.totalEstimatedTime || 'N/A'} hours</p>
                  <p><strong>Progress:</strong> {order.progress}%</p>
                </div>
                <Link
                  to={`/order/${order._id}`}
                  className="view-progress-button"
                >
                  View Order Progress
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default OngoingOrders;