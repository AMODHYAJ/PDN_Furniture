import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InventoryAIDashboard.css';

const InventoryAIDashboard = () => {
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAIRecommendations = async () => {
      try {
        const response = await axios.get('/api/inventory-ai/recommendations');
        setAiRecommendations(response.data);
      } catch (error) {
        console.error('Error fetching AI recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAIRecommendations();
  }, []);

  const handleAutoReorder = async (materialId, quantity) => {
    try {
      await axios.post('/api/inventory-ai/auto-replenish', { materialId, quantity });
      alert('Replenishment order created successfully!');
    } catch (error) {
      alert('Failed to create order: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="loading">Loading AI recommendations...</div>;

  return (
    <div className="inventory-ai-dashboard">
      <h2>Smart Inventory Management</h2>
      
      <div className="ai-cards">
        {aiRecommendations.map((rec) => (
          <div key={rec._id} className={`ai-card ${rec.priority}`}>
            <h3>{rec.materialName}</h3>
            <p>Current Stock: {rec.currentStock} {rec.unit}</p>
            <p>Status: <span className={`status-${rec.status}`}>{rec.status}</span></p>
            <p>Recommended Order: {rec.recommendedOrder} {rec.unit}</p>
            <p>Lead Time: {rec.leadTime} days</p>
            
            <div className="ai-actions">
              <button 
                onClick={() => handleAutoReorder(rec._id, rec.recommendedOrder)}
                className="ai-button"
              >
                Approve Reorder
              </button>
              <button className="ai-button secondary">
                View Impact Analysis
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryAIDashboard;