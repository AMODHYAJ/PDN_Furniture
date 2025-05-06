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
    <div className="luxury-officer-form">
      <div className="luxury-form-header">
        <h1 className="luxury-form-title">
          {isEdit ? 'Edit Delivery Officer' : 'Add New Delivery Officer'}
        </h1>
        <div className="luxury-divider"></div>
      </div>
      
      {error && (
        <div className="luxury-error-message">
          <div className="luxury-error-content">
            <span className="luxury-error-icon">⚠️</span>
            {error}
          </div>
          {error.includes('Failed to load') && (
            <button 
              onClick={() => navigate('/admin/delivery-officers')}
              className="luxury-back-btn"
            >
              Back to Team List
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="luxury-form">
        <div className="luxury-form-grid">
          <div className="luxury-form-group">
            <label className="luxury-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="luxury-input"
              placeholder="Enter officer's full name"
            />
          </div>

          <div className="luxury-form-group">
            <label className="luxury-label">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isEdit}
              className="luxury-input"
              placeholder="Enter email address"
            />
          </div>

          <div className="luxury-form-group">
            <label className="luxury-label">
              Password
              {isEdit && <span className="luxury-hint"> (leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEdit}
              className="luxury-input"
              placeholder={isEdit ? "••••••••" : "Create a password"}
            />
          </div>

          <div className="luxury-form-group">
            <label className="luxury-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="luxury-input"
              placeholder="Enter contact number"
            />
          </div>

          <div className="luxury-form-group">
            <label className="luxury-label">Role</label>
            <div className="luxury-select-wrapper">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="luxury-select"
              >
                <option value="Junior">Junior Officer</option>
                <option value="Senior">Senior Officer</option>
              </select>
              <span className="luxury-select-arrow">▼</span>
            </div>
          </div>
        </div>

        <div className="luxury-form-actions">
          <button 
            type="submit" 
            disabled={loading}
            className="luxury-submit-btn"
          >
            {loading ? (
              <>
                <span className="luxury-spinner"></span>
                Saving...
              </>
            ) : (
              <>
                <span className="luxury-btn-icon">✓</span>
                {isEdit ? 'Update Officer' : 'Add Officer'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/delivery-officers')}
            className="luxury-cancel-btn"
          >
            <span className="luxury-btn-icon">×</span>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryOfficerForm;