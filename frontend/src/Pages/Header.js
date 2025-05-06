import React from 'react';
import { Link } from 'react-router-dom';
import './AdminHeader.css';

const AdminHeader = () => {
    return (
        <div className="admin-header-container">
            <nav className="admin-navbar">
                <Link to="/manage-discounts">Discounts</Link>
                <Link to="/add-product">Add Product</Link>
                <Link to="/analytics">Analytics</Link>
            </nav>
        </div>
    );
};

export default AdminHeader;