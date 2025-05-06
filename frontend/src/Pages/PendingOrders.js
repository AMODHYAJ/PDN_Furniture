import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './PendingOrders.css';
import ProgressNavBar from "../Components/ProgressNavBar";

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [deadline, setDeadline] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [deadlineError, setDeadlineError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setSyncLoading(true);
        setError(null);
        await api.get('/tasks/sync-orders');
        const response = await api.get('/tasks/orders');
        setOrders(response.data.filter(order => 
          order.customerApproval === "Pending" && 
          order.originalOrderStatus === "processing"
        ));
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to load pending orders");
      } finally {
        setSyncLoading(false);
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getTwoWeeksFromNow = () => {
    const now = new Date();
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    return twoWeeks.toISOString().slice(0, 16);
  };

  const handleGenerateTasks = async (orderId) => {
    if (!deadline) {
      setDeadlineError('Please select a deadline.');
      return;
    }

    const selectedDeadline = new Date(deadline);
    const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    if (selectedDeadline < twoWeeksFromNow) {
      setDeadlineError('Deadline must be at least two weeks from now.');
      return;
    }

    try {
      const orderToProcess = orders.find(order => order.orderId === orderId);
      if (!orderToProcess) throw new Error('Order not found');

      const response = await api.post('/tasks/preview-tasks', {
        orderId: orderId,
        orderData: orderToProcess,
        deadline: deadline,
      });

      navigate('/taskpreview', { 
        state: { 
          tasks: response.data, 
          orderId: orderId 
        } 
      });
    } catch (error) {
      console.error("Error generating tasks:", error);
      setDeadlineError(error.response?.data?.message || 'Failed to generate tasks');
    }
  };

  if (isLoading) return (
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
      <div className="luxury-pending-orders">
        <div className="luxury-header">
          <h1 className="luxury-title">Pending Approval</h1>
          <div className="luxury-divider"></div>
        </div>
        
        {syncLoading && (
          <div className="luxury-sync-notice">
            <span className="luxury-sync-icon">🔄</span>
            Syncing with order system...
          </div>
        )}
        
        {orders.length === 0 ? (
          <div className="luxury-empty-state">
            <div className="luxury-empty-icon">📋</div>
            <h3>No Pending Approvals</h3>
            <p>All orders have been processed</p>
          </div>
        ) : (
          <ul className="luxury-orders-list">
            {orders.map(order => (
              <li key={order._id} className="luxury-order-item">
                <div className="luxury-order-info">
                  <div className="luxury-order-id">
                    <span className="luxury-label">Order ID:</span>
                    <span className="luxury-value">{order.orderId}</span>
                  </div>
                  
                  <div className="luxury-deadline-section">
                    <label className="luxury-label">Production Deadline:</label>
                    <input
                      type="datetime-local"
                      className="luxury-deadline-input"
                      value={selectedOrderId === order.orderId ? deadline : getTwoWeeksFromNow()}
                      onChange={(e) => {
                        setSelectedOrderId(order.orderId);
                        setDeadline(e.target.value);
                        setDeadlineError('');
                      }}
                      min={getTwoWeeksFromNow()}
                    />
                  </div>
                  
                  {selectedOrderId === order.orderId && deadlineError && (
                    <p className="luxury-error-text">{deadlineError}</p>
                  )}
                </div>
                
                <button 
                  onClick={() => handleGenerateTasks(order.orderId)}
                  className="luxury-generate-btn"
                >
                  Generate Production Plan
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default PendingOrders;