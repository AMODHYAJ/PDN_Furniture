import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import './DeliveryOfficerForm.css';

const DeliveryOfficerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Junior'
  });
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      setIsEdit(true);
      const fetchOfficer = async () => {
        try {
          const response = await api.get(`/delivery-officers/${id}`);
          if (response.data && response.data.officer) {
            setFormData({
              name: response.data.officer.name,
              email: response.data.officer.email,
              password: '',
              phone: response.data.officer.phone,
              role: response.data.officer.role
            });
          } else {
            setError('Officer data not found in response');
          }
        } catch (err) {
          console.error('Fetch error:', err);
          setError(err.response?.data?.message || 'Failed to load officer data');
          // Redirect if officer not found
          if (err.response?.status === 404) {
            setTimeout(() => navigate('/admin/delivery-officers'), 3000);
          }
        }
      };
      fetchOfficer();
    }
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Remove password if empty in edit mode
      const dataToSend = isEdit && !formData.password 
        ? {...formData, password: undefined}
        : formData;

      if (isEdit) {
        await api.put(`/delivery-officers/${id}`, dataToSend);
      } else {
        await api.post('/delivery-officers', dataToSend);
      }
      navigate('/admin/delivery-officers');
    } catch (err) {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Failed to save officer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-officer-form">
      <h1>{isEdit ? 'Edit Delivery Officer' : 'Add New Delivery Officer'}</h1>
      
      {error && (
        <div className="error-message">
          {error}
          {error.includes('Failed to load') && (
            <button 
              onClick={() => navigate('/admin/delivery-officers')}
              className="back-btn"
            >
              Back to List
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isEdit}
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!isEdit}
            placeholder={isEdit ? "Leave blank to keep current" : ""}
          />
        </div>

        <div className="form-group">
          <label>Phone:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Role:</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Officer'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/delivery-officers')}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryOfficerForm;