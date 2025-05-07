import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './DeliveryDashboard.css';
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Inter:wght@400;500&display=swap" rel="stylesheet"></link>

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

  if (loading) return (
    <div className="delivery-loading">
      <div className="loading-spinner"></div>
      <p>Loading deliveries...</p>
    </div>
  );
  
  if (error) return (
    <div className="delivery-error">
      <span className="error-icon">⚠️</span>
      {error}
    </div>
  );

  return (
    <div className="delivery-container">
      <div className="delivery-header">
        <h1 className="delivery-title">Delivery Management</h1>
        <p className="delivery-subtitle">Track and manage furniture deliveries</p>
        <div className="divider"></div>
      </div>
      
      <div className="status-filter">
        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="status-select"
        >
          <option value="assigned">Assigned Deliveries</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Completed Deliveries</option>
        </select>
      </div>
      
      <div className="delivery-grid">
        {assignedOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No {selectedStatus.replace('_', ' ')} deliveries</h3>
            <p>Currently there are no deliveries in this category</p>
          </div>
        ) : (
          assignedOrders.map(order => (
            <div key={order._id} className="delivery-card">
              <div className="card-header">
                <h3 className="order-id">ORDER #{order._id.substring(0, 8).toUpperCase()}</h3>
                <span className={`status-badge ${order.deliveryStatus}`}>
                  {order.deliveryStatus.replace('_', ' ')}
                </span>
              </div>
              
              <div className="card-body">
                <div className="detail-row">
                  <span className="detail-label">Customer:</span>
                  <span className="detail-value">{order.userId?.name || 'N/A'}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">
                    {order.shippingAddress?.address || 'N/A'}, {order.shippingAddress?.city || 'N/A'}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Delivery Date:</span>
                  <span className="detail-value">
                    {order.estimatedDeliveryDate ? 
                      new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="card-footer">
                {order.deliveryStatus === 'assigned' && (
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'in_transit')}
                    disabled={loading}
                    className="action-btn begin-delivery"
                  >
                    Begin Delivery
                  </button>
                )}
                
                {order.deliveryStatus === 'in_transit' && (
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                    disabled={loading}
                    className="action-btn complete-delivery"
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