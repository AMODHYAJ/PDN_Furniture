import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('assigned');

  useEffect(() => {
    const fetchAssignedOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/delivery/assigned?status=${selectedStatus}`);
        setAssignedOrders(response.data.orders);
      } catch (err) {
        setError('Failed to load assigned orders');
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedOrders();
  }, [selectedStatus]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      setLoading(true);
      const response = await api.put(`/delivery/${orderId}/status`, { status });
      setAssignedOrders(assignedOrders.map(order => 
        order._id === orderId ? response.data.order : order
      ));
    } catch (err) {
      setError('Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="delivery-dashboard">
      <h1>Delivery Dashboard</h1>
      
      <div className="status-filter">
        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="assigned">Assigned</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>
      
      <div className="orders-list">
        {assignedOrders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          assignedOrders.map(order => (
            <div key={order._id} className="order-card">
              <h3>Order #{order._id.substring(0, 8).toUpperCase()}</h3>
              <p><strong>Customer:</strong> {order.userId.name}</p>
              <p><strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
              <p><strong>Estimated Delivery:</strong> {new Date(order.estimatedDeliveryDate).toLocaleDateString()}</p>
              
              <div className="status-actions">
                {order.deliveryStatus === 'assigned' && (
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'in_transit')}
                    disabled={loading}
                  >
                    Mark as In Transit
                  </button>
                )}
                
                {order.deliveryStatus === 'in_transit' && (
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                    disabled={loading}
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;