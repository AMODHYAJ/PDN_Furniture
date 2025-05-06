import React, { useState, useEffect } from "react";
import api from "../utils/api";
import "./AssignDeliveryModal.css";

const AssignDeliveryModal = ({ order, onClose, onAssign }) => {
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState("");
  const [estimatedDate, setEstimatedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [fee, setFee] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAvailableOfficers = async () => {
      try {
        const response = await api.get("/delivery/officers?available=true");
        setOfficers(response.data.officers);
      } catch (err) {
        console.error("Failed to fetch officers:", err);
        setError("Failed to load available officers. Please try again.");
      }
    };
    fetchAvailableOfficers();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(order._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateForm = () => {
    const errors = {};
    if (!selectedOfficer) errors.officer = "Please select a delivery officer";
    if (!estimatedDate) {
      errors.date = "Please select an estimated delivery date";
    } else if (new Date(estimatedDate) < new Date()) {
      errors.date = "Delivery date cannot be in the past";
    }
    if (fee && isNaN(Number(fee))) {
      errors.fee = "Delivery fee must be a number";
    } else if (fee && Number(fee) < 0) {
      errors.fee = "Delivery fee cannot be negative";
    }
    if (order._id.length !== 24) {
      errors.orderId = "Invalid order ID format - must be 24 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setLoading(true);
    setError('');
  
    try {
      const response = await api.post('/orders/assign-delivery', {
        orderId: order._id,
        officerId: selectedOfficer,
        estimatedDate,
        notes: notes || undefined,
        fee: fee ? Number(fee) : 0
      });
  
      if (response.data.success) {
        onAssign(response.data.order);
        onClose();
      } else {
        setError(response.data.message || 'Assignment failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-modal-overlay">
      <div className="luxury-modal-content">
        <h2>Assign Order to Delivery</h2>
        
        <div className="luxury-order-id-display">
          <p>
            <strong>Order ID:</strong> 
            <span title={`Full ID: ${order._id}`}>
              #{order._id.substring(0, 8).toUpperCase()}
            </span>
            <button 
              onClick={copyToClipboard}
              className={`luxury-copy-btn ${copied ? "copied" : ""}`}
              title="Copy full ID to clipboard"
            >
              {copied ? "✓ Copied" : "Copy ID"}
            </button>
          </p>
          {formErrors.orderId && (
            <p className="luxury-field-error">{formErrors.orderId}</p>
          )}
        </div>

        {error && (
          <div className="luxury-error-message">
            <div className="luxury-error-content">
              {error.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <button onClick={() => setError("")} className="luxury-dismiss-error">
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={`luxury-form-group ${formErrors.officer ? "error" : ""}`}>
            <label>Available Officers:</label>
            <select
              value={selectedOfficer}
              onChange={(e) => {
                setSelectedOfficer(e.target.value);
                setFormErrors({ ...formErrors, officer: "" });
              }}
              required
            >
              <option value="">Select Officer</option>
              {officers.map((officer) => (
                <option key={officer._id} value={officer._id}>
                  {officer.name} - {officer.phone} ({officer.role})
                </option>
              ))}
            </select>
            {formErrors.officer && (
              <span className="luxury-field-error">{formErrors.officer}</span>
            )}
          </div>

          <div className={`luxury-form-group ${formErrors.date ? "error" : ""}`}>
            <label>Estimated Delivery Date:</label>
            <input
              type="datetime-local"
              value={estimatedDate}
              onChange={(e) => {
                setEstimatedDate(e.target.value);
                setFormErrors({ ...formErrors, date: "" });
              }}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
            {formErrors.date && (
              <span className="luxury-field-error">{formErrors.date}</span>
            )}
          </div>

          <div className={`luxury-form-group ${formErrors.fee ? "error" : ""}`}>
            <label>Delivery Fee:</label>
            <input
              type="number"
              value={fee}
              onChange={(e) => {
                setFee(e.target.value);
                setFormErrors({ ...formErrors, fee: "" });
              }}
              min="0"
              step="0.01"
              placeholder="Enter amount (optional)"
            />
            {formErrors.fee && (
              <span className="luxury-field-error">{formErrors.fee}</span>
            )}
          </div>

          <div className="luxury-form-group">
            <label>Special Instructions:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              placeholder="Any special delivery instructions..."
            />
          </div>

          <div className="luxury-modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="luxury-cancel-btn"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="luxury-submit-btn"
            >
              {loading ? (
                <>
                  <span className="luxury-spinner"></span>
                  Assigning...
                </>
              ) : (
                "Assign Order"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignDeliveryModal;