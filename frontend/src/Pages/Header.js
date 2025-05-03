import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // You can style the header here

const Header = () => {
    return (
        <header className="header">
            
            <nav className="navbar">
                <Link to="/">Manage Products</Link>
                <Link to="/customer-dashboard">Go to Customer Dashboard</Link>
                <Link to="/manage-discounts">Discounts</Link>
                <Link to="/add-product">Add Product</Link>
                <Link to="/analytics">Analytics</Link>
            </nav>
        </header>
    );
};

export default Header;