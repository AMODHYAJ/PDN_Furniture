import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import api from "../utils/api";
import { getProductImageUrl, handleImageError } from "../utils/imageUtils";
import "./AdminOrderDetails.css";

// Debug 1: Log when component file loads
console.log("AdminOrderDetails component loaded");

const isValidObjectId = (id) => {
  // Debug 2: Log ID validation checks
  console.log("Validating ID:", id);
  if (!id) return false;
  const isValid =
    /^[0-9a-fA-F]{24}$/.test(id) ||
    (typeof id === "string" && id.length === 24);
  console.log("ID validation result:", isValid);
  return isValid;
};

const AdminOrderDetails = () => {
  // Debug 3: Log the extracted orderId from URL params
  const { orderId } = useParams();
  console.log("Extracted orderId from URL params:", orderId, typeof orderId);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Debug 4: Log when useEffect runs
    console.log("useEffect triggered with orderId:", orderId);

    if (!isAdmin) {
      console.log("User is not admin, redirecting...");
      navigate("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        // Debug 5: Log before validation
        console.log("Validating orderId:", orderId);

        if (!orderId) {
          console.error("Missing orderId - throwing error");
          throw new Error("Order ID is required");
        }

        if (!isValidObjectId(orderId)) {
          console.error("Invalid orderId format:", orderId);
          throw new Error(
            `Invalid order ID format: ${orderId}. Expected 24-character hex string.`
          );
        }

        // Debug 6: Log before API call
        console.log("Making API request for orderId:", orderId);
        const response = await api.get(`/orders/admin/${orderId}`);
        console.log("API response:", response);

        if (!response.data?.order) {
          console.error("Order not found in response:", response);
          throw new Error(`Order with ID ${orderId} not found`);
        }

        console.log("Setting order data:", response.data.order);
        setOrder(response.data.order);
        setStatus(response.data.order.status);
      } catch (err) {
        console.error("Fetch order error details:", {
          error: err,
          message: err.message,
          stack: err.stack,
          response: err.response,
        });
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load order details"
        );
        if (err.message.includes("Invalid order ID format")) {
          console.log("Redirecting due to invalid ID format");
          setTimeout(() => navigate("/admin/orders"), 3000);
        }
      } finally {
        console.log("Finished loading attempt");
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, isAdmin, navigate]);

  const handleStatusUpdate = async () => {
    if (!orderId || !status) return;

    try {
      setIsUpdating(true);
      const response = await api.put(`/orders/admin/${orderId}/update-status`, {
        status,
      });

      if (response.data && response.data.order) {
        setOrder(response.data.order);
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update order status"
      );
    } finally {
      setIsUpdating(false);
    }
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
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className="loading">Loading order details...</div>;
  if (error)
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <button
          className="back-button"
          onClick={() => navigate("/admin/orders")}
        >
          &larr; Back to Orders
        </button>
      </div>
    );

  return (
    <div className="admin-order-details">
      <button className="back-button" onClick={() => navigate("/admin/orders")}>
        &larr; Back to Orders
      </button>

      <div className="order-header">
        <h1>Order #{order?._id?.substring(0, 8).toUpperCase()}</h1>
        <div className="order-meta">
          <div className="order-status">
            {getStatusBadge(order?.status)}
            <span>Placed on {formatDate(order?.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="order-sections">
        <div className="order-items-section">
          <h2>Order Items</h2>
          <div className="order-items-list">
            {order?.items?.map((item, index) => (
              <div key={index} className="order-item">
                <img
                  src={getProductImageUrl(item.productId?.image)}
                  alt={item.productId?.name}
                  className="product-image"
                  onError={handleImageError}
                />
                <div className="item-details">
                  <h4>{item.productId?.name}</h4>
                  <div className="item-meta">
                    <span>Quantity: {item.quantity}</span>
                    <span>Price: Rs. {item.price?.toFixed(2)}</span>
                    <span>
                      Total: Rs. {(item.price * item.quantity)?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>Rs. {order?.totalPrice?.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Rs. 0.00</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>Rs. {order?.totalPrice?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="order-info-section">
          <div className="customer-info">
            <h2>Customer Information</h2>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">
                  {order?.userId?.name || "Guest"}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">
                  {order?.userId?.email || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="shipping-info">
            <h2>Shipping Information</h2>
            <div className="info-grid">
              <div className="info-row">
                <span className="info-label">Address:</span>
                <span className="info-value">
                  {order?.shippingAddress?.address}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">City:</span>
                <span className="info-value">
                  {order?.shippingAddress?.city}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Postal Code:</span>
                <span className="info-value">
                  {order?.shippingAddress?.postalCode}
                </span>
              </div>
            </div>
          </div>

          <div className="timeline-info">
            <h2>Order Timeline</h2>
            <div className="timeline">
              <div className="timeline-event">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <h4>Order Placed</h4>
                  <p>{formatDate(order?.createdAt)}</p>
                </div>
              </div>

              {order?.shippedAt && (
                <div className="timeline-event">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>Shipped</h4>
                    <p>{formatDate(order.shippedAt)}</p>
                  </div>
                </div>
              )}

              {order?.deliveredAt && (
                <div className="timeline-event">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>Delivered</h4>
                    <p>{formatDate(order.deliveredAt)}</p>
                  </div>
                </div>
              )}

              {order?.cancelledAt && (
                <div className="timeline-event">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>Cancelled</h4>
                    <p>{formatDate(order.cancelledAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="status-update">
            <h2>Update Status</h2>
            <div className="status-controls">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isUpdating}
              >
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={isUpdating || status === order?.status}
              >
                {isUpdating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
