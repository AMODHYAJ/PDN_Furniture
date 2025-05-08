import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import NotificationBell from './NotificationBell';
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isAdmin ? "/admin-dashboard" : "/"} className="navbar-brand">
          <img 
            src="http://localhost:5000/images/logo.png" 
            alt="PDN Products Logo" 
            className="brand-logo"
          />
          <span className="brand-name">PDN PRODUCTS</span>
        </Link>
        
        <div className="navbar-links">
          {/* Show Catalog only for non-admin users */}
          {!isAdmin && <Link to="/products" className="nav-link">Catalog</Link>}
          
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                <>
                  <Link to="/admin/orders" className="nav-link">Orders</Link>
                  <Link to="/admin/products" className="nav-link">Products</Link>
                  <Link to="/admin/users" className="nav-link">Users</Link>
                  <Link to="/admin/inventory" className="nav-link">Inventory</Link>
                  <Link to="/admin/inventory-ai" className="nav-link">Inventory AI</Link>
                  <Link to="/admin/workforce" className="nav-link">Production Progress</Link>
                  <Link to="/admin/delivery" className="nav-link">Delivery</Link>
                  <Link to="/admin/delivery-officers" className="nav-link">Delivery Officers</Link>
                  <div className="nav-link-with-bell">
                    <Link to="/admin/stats" className="nav-link">Statistics</Link>
                    <NotificationBell />
                  </div>
                </>
              ) : (
                <>
                  <Link to="/profile" className="nav-link">Profile</Link>
                  <Link to="/wishlist" className="nav-link">Wishlist</Link>
                  <Link to="/cart" className="nav-link">Cart</Link>
                  <Link to="/orders/history" className="nav-link">Order History</Link>
                </>
              )}
              
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;