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

  if (loading) return (
    <div className="luxury-loading">
      <div className="luxury-spinner"></div>
      <p>Loading deliveries...</p>
    </div>
  );
  
  if (error) return (
    <div className="luxury-error-message">
      <span className="luxury-error-icon">⚠️</span>
      {error}
    </div>
  );

  return (
    <div className="luxury-delivery-dashboard">
      <div className="luxury-header">
        <h1 className="luxury-title">Delivery Management</h1>
        <div className="luxury-divider"></div>
      </div>
      
      <div className="luxury-status-filter">
        <select 
          value={selectedStatus} 
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="luxury-status-select"
        >
          <option value="assigned">Assigned Deliveries</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Completed Deliveries</option>
        </select>
      </div>
      
      <div className="luxury-orders-grid">
        {assignedOrders.length === 0 ? (
          <div className="luxury-empty-state">
            <div className="luxury-empty-icon">📦</div>
            <p>No {selectedStatus.replace('_', ' ')} deliveries found</p>
          </div>
        ) : (
          assignedOrders.map(order => (
            <div key={order._id} className="luxury-order-card">
              <div className="luxury-order-header">
                <h3 className="luxury-order-id">ORDER #{order._id.substring(0, 8).toUpperCase()}</h3>
                <span className={`luxury-status-badge ${order.deliveryStatus}`}>
                  {order.deliveryStatus.replace('_', ' ')}
                </span>
              </div>
              
              <div className="luxury-order-details">
                <div className="luxury-detail-row">
                  <span className="luxury-detail-label">Customer:</span>
                  <span className="luxury-detail-value">{order.userId.name}</span>
                </div>
                
                <div className="luxury-detail-row">
                  <span className="luxury-detail-label">Delivery Address:</span>
                  <span className="luxury-detail-value">
                    {order.shippingAddress.address}, {order.shippingAddress.city}
                  </span>
                </div>
                
                <div className="luxury-detail-row">
                  <span className="luxury-detail-label">Estimated Delivery:</span>
                  <span className="luxury-detail-value">
                    {new Date(order.estimatedDeliveryDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="luxury-order-actions">
                {order.deliveryStatus === 'assigned' && (
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'in_transit')}
                    disabled={loading}
                    className="luxury-action-btn transit-btn"
                  >
                    Begin Delivery
                  </button>
                )}
                
                {order.deliveryStatus === 'in_transit' && (
                  <button 
                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                    disabled={loading}
                    className="luxury-action-btn deliver-btn"
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