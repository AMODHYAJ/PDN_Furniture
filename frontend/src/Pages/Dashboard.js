import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1>User Dashboard</h1>
      <div className="dashboard-links">
        <Link to="/profile" className="dashboard-card">
          <h2>My Profile</h2>
          <p>View and edit your profile</p>
        </Link>
        <Link to="/orders/history" className="dashboard-card">
          <h2>My Orders</h2>
          <p>View your order history</p>
        </Link>
        <Link to="/wishlist" className="dashboard-card">
          <h2>Wishlist</h2>
          <p>View your saved items</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;