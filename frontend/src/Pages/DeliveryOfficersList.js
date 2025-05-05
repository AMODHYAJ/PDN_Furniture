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

  if (loading) return <div className="loading">Loading officers...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="delivery-officers-container">
      <div className="header">
        <h1>Delivery Officers</h1>
        <Link to="/admin/delivery-officers/add" className="add-btn">
          Add New Officer
        </Link>
      </div>

      <table className="officers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {officers.map(officer => (
            <tr key={officer._id}>
              <td>{officer.name}</td>
              <td>{officer.email}</td>
              <td>{officer.phone}</td>
              <td>{officer.role}</td>
              <td>
                <span className={`status ${officer.isAvailable ? 'available' : 'unavailable'}`}>
                  {officer.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </td>
              <td className="actions">
                <button
                  onClick={() => handleToggleAvailability(officer._id, officer.isAvailable)}
                  className={`toggle-btn ${officer.isAvailable ? 'make-unavailable' : 'make-available'}`}
                >
                  {officer.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <Link to={`/admin/delivery-officers/edit/${officer._id}`} className="edit-btn">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(officer._id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveryOfficersList;