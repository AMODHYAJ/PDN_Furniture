import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const statusClasses = {
    pending: 'badge-secondary',
    processing: 'badge-info',
    completed: 'badge-primary',
    shipped: 'badge-warning',
    delivered: 'badge-success',
    cancelled: 'badge-danger'
  };

  return (
    <span className={`badge ${statusClasses[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StatusBadge;