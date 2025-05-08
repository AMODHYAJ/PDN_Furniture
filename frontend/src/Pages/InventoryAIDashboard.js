import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './InventoryAIDashboard.css';

const InventoryAIDashboard = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/inventory-ai/recommendations');
      
      if (response.data && response.data.success) {
        setRecommendations(response.data.recommendations || []);
      } else {
        setError(response.data?.message || 'Failed to load recommendations');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoReorder = async (materialId, quantity) => {
    try {
      const response = await api.post('/api/inventory-ai/auto-replenish', {
        materialId,
        quantity
      });

      if (response.data.success) {
        setSuccess('Replenishment order created!');
        setRecommendations(prev => prev.filter(item => item._id !== materialId));
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
      setTimeout(() => setError(null), 3000);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#ff4444',
      high: '#ffbb33',
      medium: '#33b5e5',
      low: '#00C851'
    };
    return colors[priority.toLowerCase()] || '#33b5e5';
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
        <button className="retry-button" onClick={fetchRecommendations}>
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
      </div>

      {success && <div className="success-message">{success}</div>}

      {recommendations.length === 0 ? (
        <div className="no-recommendations">
          <p>All inventory levels are optimal</p>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map(rec => (
            <div 
              key={rec._id} 
              className="recommendation-card"
              style={{ borderLeft: `5px solid ${getPriorityColor(rec.priority)}` }}
            >
              <div className="card-header">
                <h3>{rec.materialName}</h3>
                <span className={`status-badge ${rec.status.toLowerCase().replace(' ', '-')}`}>
                  {rec.status}
                </span>
              </div>

              <div className="card-body">
                <div className="metric">
                  <span>Current Stock:</span>
                  <span>{rec.currentStock} {rec.unit}</span>
                </div>
                
                <div className="metric">
                  <span>Recommended:</span>
                  <span className="highlight">{rec.recommendedOrder} {rec.unit}</span>
                </div>
                
                <div className="metric">
                  <span>Lead Time:</span>
                  <span>{rec.leadTime} days</span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="action-button primary"
                  onClick={() => handleAutoReorder(rec._id, rec.recommendedOrder)}
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