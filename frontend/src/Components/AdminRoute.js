// Components/AdminRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Allow both admin and inventory_manager roles
    if (!isAdmin && user?.role !== 'inventory_manager') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;