import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import './DeliveryOfficersList.css';

const DeliveryOfficersList = () => {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        const response = await api.get('/delivery-officers');
        setOfficers(response.data.officers);
      } catch (err) {
        setError('Failed to load delivery officers');
      } finally {
        setLoading(false);
      }
    };
    fetchOfficers();
  }, []);

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      const response = await api.patch(`/delivery-officers/${id}/availability`, {
        isAvailable: !currentStatus
      });
      setOfficers(officers.map(officer => 
        officer._id === id ? response.data.officer : officer
      ));
    } catch (err) {
      setError('Failed to update availability');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this officer?')) {
      try {
        await api.delete(`/delivery-officers/${id}`);
        setOfficers(officers.filter(officer => officer._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete officer');
      }
    }
  };

  if (loading) return (
    <div className="luxury-loading">
      <div className="luxury-spinner"></div>
      <p>Loading delivery team...</p>
    </div>
  );
  
  if (error) return (
    <div className="luxury-error-message">
      <span className="luxury-error-icon">⚠️</span>
      {error}
    </div>
  );

  return (
    <div className="luxury-officers-container">
      <div className="luxury-header">
        <h1 className="luxury-title">Delivery Team Management</h1>
        <div className="luxury-divider"></div>
      </div>

      <div className="luxury-controls">
        <Link to="/admin/delivery-officers/add" className="luxury-add-btn">
          <span className="luxury-btn-icon">+</span> Add New Officer
        </Link>
      </div>

      <div className="luxury-table-container">
        <table className="luxury-officers-table">
          <thead>
            <tr>
              <th>Officer</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {officers.map(officer => (
              <tr key={officer._id} className="luxury-table-row">
                <td className="luxury-officer-name">
                  <div className="luxury-name">{officer.name}</div>
                  <div className="luxury-email">{officer.email}</div>
                </td>
                <td className="luxury-phone">{officer.phone || 'N/A'}</td>
                <td className="luxury-role">
                  <span className={`luxury-role-tag ${officer.role.toLowerCase()}`}>
                    {officer.role}
                  </span>
                </td>
                <td>
                  <span className={`luxury-status ${officer.isAvailable ? 'available' : 'unavailable'}`}>
                    <span className="luxury-status-indicator"></span>
                    {officer.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="luxury-actions">
                  <button
                    onClick={() => handleToggleAvailability(officer._id, officer.isAvailable)}
                    className={`luxury-action-btn ${officer.isAvailable ? 'make-unavailable' : 'make-available'}`}
                  >
                    {officer.isAvailable ? 'Set Unavailable' : 'Set Available'}
                  </button>
                  <Link to={`/admin/delivery-officers/edit/${officer._id}`} className="luxury-action-btn luxury-edit-btn">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(officer._id)}
                    className="luxury-action-btn luxury-delete-btn"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryOfficersList;