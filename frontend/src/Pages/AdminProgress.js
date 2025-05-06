import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './AdminProgress.css';
import ProgressNavBar from "../Components/ProgressNavBar";

const AdminProgress = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [ongoingCount, setOngoingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [delayedCount, setDelayedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResponse, delayedResponse] = await Promise.all([
          api.get('/tasks/orders'),
          api.get('/tasks/delays')
        ]);

        const orders = ordersResponse.data;
        const delayed = delayedResponse.data;

        setPendingCount(orders.filter(order => order.customerApproval === "Pending").length);
        setOngoingCount(orders.filter(order => 
          order.progress >= 0 && 
          order.progress < 100 && 
          order.customerApproval === "Approved"
        ).length);
        setCompletedCount(orders.filter(order => order.progress === 100).length);
        setDelayedCount(delayed.length);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="luxury-dashboard-container">Loading dashboard...</div>;
  if (error) return <div className="luxury-dashboard-container">Error: {error}</div>;

  return (
    <>
      <ProgressNavBar />
      <div className="luxury-dashboard-container">
        <h2>Production Dashboard</h2>
        <div className="luxury-dashboard-grid">
          <div className="luxury-dashboard-grid-item luxury-pending">
            <h3>Pending Orders</h3>
            <p className="luxury-count">{pendingCount}</p>
          </div>
          <div className="luxury-dashboard-grid-item luxury-ongoing">
            <h3>Ongoing Orders</h3>
            <p className="luxury-count">{ongoingCount}</p>
          </div>
          <div className="luxury-dashboard-grid-item luxury-completed">
            <h3>Completed Orders</h3>
            <p className="luxury-count">{completedCount}</p>
          </div>
          <div className="luxury-dashboard-grid-item luxury-delayed">
            <h3>Delayed Tasks</h3>
            <p className="luxury-count">{delayedCount}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminProgress;