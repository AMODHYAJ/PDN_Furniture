import React, { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './OrderHistory.css';
import { getProductImageUrl, handleImageError } from "../utils/imageUtils";

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    totalPages: 1,
    totalOrders: 0
  });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/orders/user/history`,
          {
            params: {
              page: pagination.page,
              limit: pagination.limit,
              status: filter === 'all' ? undefined : filter
            }
          }
        );
        
        setOrders(response.data.orders);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.totalPages,
          totalOrders: response.data.totalOrders
        }));
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch orders');
        console.error('Order history error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrderHistory();
    }
  }, [user, pagination.page, pagination.limit, filter]);

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      processing: 'badge-processing',
      shipped: 'badge-shipped',
      delivered: 'badge-delivered',
      cancelled: 'badge-cancelled'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status] || 'badge-default'}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="loading-spinner">Loading your orders...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h2>Your Order History</h2>
        <div className="order-history-controls">
          <div className="filter-control">
            <label htmlFor="status-filter">Filter by status:</label>
            <select
              id="status-filter"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filter changes
              }}
            >
              <option value="all">All Orders</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders-found">
          <p>No orders found</p>
          <button 
            className="continue-shopping-btn"
            onClick={() => navigate('/products')}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-card-header">
                  <div className="order-meta">
                  <div className="order-number-user">
                    <h3>Order #{order._id.substring(0, 8).toUpperCase()}</h3>
                    <span className="order-user">Order by: {user?.name}</span>
                    </div>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="order-status">
                    {getStatusBadge(order.status)}
                    <span className="order-total">Rs. {order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="order-items-preview">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="preview-item">
                      {item.productId?.image && (
                        <img 
                        src={getProductImageUrl(item.productId?.image)} 
                        alt={item.productId?.name} 
                        className="product-thumbnail"
                        onError={handleImageError}
                      />
                      )}
                      <span className="item-name">{item.productId?.name}</span>
                      <span className="item-quantity">× {item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="additional-items">
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>

                <div className="order-card-footer">
                  <button 
                    className="view-details-btn"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination-controls">
              <button
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
                className="pagination-btn"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={pagination.page === pageNum}
                    className={`pagination-btn ${pagination.page === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}

          <div className="order-history-summary">
            Showing {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.totalOrders)} of {pagination.totalOrders} orders
          </div>
        </>
      )}
    </div>
  );
};

export default OrderHistory;