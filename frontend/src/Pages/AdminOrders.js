import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import api from "../utils/api";
import "./AdminOrders.css";

const AdminOrders = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalOrders: 0,
  });
  const [filters, setFilters] = useState({
    status: "all",
    sort: "-createdAt",
  });

  const fetchOrders = useCallback(async () => {
    if (!isAdmin) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sort: filters.sort
      };
      
      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      const response = await api.get('/orders/admin/all-orders', { params });
      
      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
        setPagination({
          page: response.data.currentPage || pagination.page,
          limit: pagination.limit,
          totalPages: response.data.totalPages || 1,
          totalOrders: response.data.totalOrders || 0
        });
      }
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else if (err.response?.status === 403) {
        setError('You are not authorized to view this page');
      } else {
        setError(err.message || 'Failed to fetch orders');
      }
    } finally {
      setLoading(false);
    }
  }, [isAdmin, navigate, pagination.page, pagination.limit, filters, logout]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleStatusFilterChange = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (e) => {
    setFilters((prev) => ({ ...prev, sort: e.target.value }));
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      processing: "badge-processing",
      shipped: "badge-shipped",
      delivered: "badge-delivered",
      cancelled: "badge-cancelled",
    };

    return (
      <span
        className={`status-badge ${statusClasses[status] || "badge-default"}`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className="loading">Loading orders...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-orders-container">
      <div className="admin-orders-header">
        <h1>Order Management</h1>
        <div className="admin-orders-controls">
          <div className="filter-control">
            <label htmlFor="status-filter">Filter by status:</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Orders</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="sort-control">
            <label htmlFor="sort">Sort by:</label>
            <select id="sort" value={filters.sort} onChange={handleSortChange}>
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-totalPrice">Highest Amount</option>
              <option value="totalPrice">Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>#{order._id.substring(0, 8)}</td>
                <td>
                  {order.userId?.name || "Guest"}
                  <br />
                  <small>{order.userId?.email || ""}</small>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>{order.items.length} item(s)</td>
                <td>Rs. {order.totalPrice.toFixed(2)}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination-controls">
          <button
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>

          {Array.from(
            { length: Math.min(5, pagination.totalPages) },
            (_, i) => {
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
                  className={pagination.page === pageNum ? "active" : ""}
                >
                  {pageNum}
                </button>
              );
            }
          )}

          <button
            disabled={pagination.page === pagination.totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      <div className="orders-summary">
        Showing {(pagination.page - 1) * pagination.limit + 1}-
        {Math.min(pagination.page * pagination.limit, pagination.totalOrders)}{" "}
        of {pagination.totalOrders} orders
      </div>
    </div>
  );
};

export default AdminOrders;