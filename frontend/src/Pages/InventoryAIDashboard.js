import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../Context/AuthContext";
import api from "../utils/api";
import "./InventoryAIDashboard.css";

const InventoryAIDashboard = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/inventory-ai/recommendations");

      if (response.data.success) {
        setRecommendations(response.data.recommendations || []);
      } else {
        setError(response.data.message || "No recommendations available");
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError(err.response?.data?.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleAutoReorder = async (materialId, quantity, materialName, unit) => {
    try {
      setLoading(true);
      const response = await api.post("/api/inventory-ai/auto-replenish", {
        materialId,
        quantity,
        materialName,
        unit,
      });
  
      if (response.data.success) {
        setSuccess(`Added ${quantity} ${unit} of ${materialName} to inventory!`);
        
        // Refresh the recommendations after successful update
        await fetchRecommendations();
        
        setTimeout(() => {
          setSuccess(null);
          setLoading(false);
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update inventory");
      setTimeout(() => setError(null), 3000);
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: "#ff4444",
      high: "#ffbb33",
      medium: "#33b5e5",
      low: "#00C851",
    };
    return colors[priority.toLowerCase()] || "#33b5e5";
  };

  const handleRefresh = () => {
    fetchRecommendations();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading AI recommendations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={handleRefresh}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="inventory-ai-dashboard">
      <div className="dashboard-header">
        <h2>Smart Inventory Management</h2>
        <p className="subtitle">AI-powered inventory optimization</p>
        <button
          className="refresh-button"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {success && <div className="success-message">{success}</div>}

      {recommendations.length === 0 ? (
        <div className="no-recommendations">
          <p>All inventory levels are optimal</p>
          <button className="refresh-button" onClick={handleRefresh}>
            Check Again
          </button>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((rec) => (
            <div
              key={rec._id}
              className="recommendation-card"
              style={{
                borderLeft: `5px solid ${getPriorityColor(rec.priority)}`,
              }}
            >
              <div className="card-header">
                <h3>{rec.materialName}</h3>
                <span
                  className={`status-badge ${rec.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {rec.status}
                </span>
              </div>

              <div className="card-body">
                <div className="metric">
                  <span>Current Stock:</span>
                  <span>
                    {rec.currentStock} {rec.unit}
                  </span>
                </div>

                <div className="metric">
                  <span>Weekly Usage:</span>
                  <span>
                    {rec.weeklyUsage} {rec.unit}/week
                  </span>
                </div>

                <div className="metric">
                  <span>Recommended Order:</span>
                  <span className="highlight">
                    {rec.recommendedOrder} {rec.unit}
                    {rec.recommendedOrder > 0 && (
                      <span className="recommendation-note">
                        (Covers {rec.leadTime} days with 20% buffer)
                      </span>
                    )}
                  </span>
                </div>

                <div className="metric">
                  <span>Reorder Threshold:</span>
                  <span>
                    {rec.reorderThreshold} {rec.unit}
                  </span>
                </div>

                <div className="metric">
                  <span>Optimal Level:</span>
                  <span>
                    {rec.optimalStockLevel} {rec.unit}
                  </span>
                </div>

                <div className="metric">
                  <span>Lead Time:</span>
                  <span>{rec.leadTime} days</span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="action-button primary"
                  onClick={() =>
                    handleAutoReorder(
                      rec._id,
                      rec.recommendedOrder,
                      rec.materialName,
                      rec.unit
                    )
                  }
                >
                  Approve Reorder
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventoryAIDashboard;