import React from 'react';
import { Link } from 'react-router-dom';
import './ProgressNavBar.css';

const ProgressNavBar = () => {
    return (
        <nav className="progress-navbar"> {/* Changed class name */}
            <Link to="/pending" className="nav-link">Pending Orders</Link>
            <Link to="/ongoing" className="nav-link">Ongoing Orders</Link>
            <Link to="/completed" className="nav-link">Completed Orders</Link>
            <Link to="/employees" className="nav-link">Employees</Link>
            <Link to="/alerts" className="nav-link">Alerts</Link>
        </nav>
    );
};

export default ProgressNavBar;