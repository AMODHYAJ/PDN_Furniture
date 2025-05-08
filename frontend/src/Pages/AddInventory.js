import React, { useState } from 'react';
import api from "../utils/api"; 
import { useNavigate } from 'react-router-dom'; 
import './AddInventory.css';

const AddInventory = () => {
  const [newInventory, setNewInventory] = useState({
    materialName: '',
    quantity: '',
    unit: '',
    wastageQuantity: '',
    availability: true,
    reorderThreshold: '',
    optimalStockLevel: '',
    leadTime: '',
    autoReorder: false,
    supplier: {
      name: '',
      contact: '',
      email: '',
      address: ''
    }
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); 


  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested supplier fields
    if (name.startsWith('supplier.')) {
      const supplierField = name.split('.')[1];
      setNewInventory(prev => ({
        ...prev,
        supplier: {
          ...prev.supplier,
          [supplierField]: value
        }
      }));
    } else {
      setNewInventory(prev => ({
        ...prev,
        [name]: name === 'autoReorder' || name === 'availability' 
          ? value === 'true' 
          : value,
      }));
    }
  };

  const validateForm = () => {
    if (!newInventory.materialName) {
      return 'Material name is required.';
    }
    if (isNaN(newInventory.quantity) || newInventory.quantity <= 0) {
      return 'Quantity must be a positive number.';
    }
    if (isNaN(newInventory.wastageQuantity) || newInventory.wastageQuantity < 0) {
      return 'Wastage quantity must be a non-negative number.';
    }
    if (!newInventory.unit) {
      return 'Unit is required.';
    }
    if (isNaN(newInventory.reorderThreshold) || newInventory.reorderThreshold < 0) {
      return 'Reorder threshold must be a non-negative number.';
    }
    if (isNaN(newInventory.optimalStockLevel) || newInventory.optimalStockLevel <= 0) {
      return 'Optimal stock level must be a positive number.';
    }
    if (isNaN(newInventory.leadTime) || newInventory.leadTime < 1) {
      return 'Lead time must be at least 1 day.';
    }
    return ''; 
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    try {
      await api.post('/inventory', newInventory);
      setSuccess('Item added successfully!');
      setError('');
      setNewInventory({
        materialName: '',
        quantity: '',
        unit: '',
        wastageQuantity: '',
        availability: true,
        reorderThreshold: '',
        optimalStockLevel: '',
        leadTime: '',
        autoReorder: false,
        supplier: {
          name: '',
          contact: '',
          email: '',
          address: ''
        }
      });
      setTimeout(() => {
        setSuccess('');
      }, 3000);
      navigate('/admin/inventory');
    } catch (error) {
      console.error('Error adding inventory:', error);
      setError('Error adding inventory. Please try again later.');
      setSuccess('');
    }
  };

  return (
    <div className="add-inventory-container">
      <h2>Add New Inventory Item</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleAddInventory}>
        <div>
          <label>Material Name:</label>
          <input
            type="text"
            name="materialName"
            value={newInventory.materialName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={newInventory.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Unit:</label>
          <input
            type="text"
            name="unit"
            value={newInventory.unit}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Wastage Quantity:</label>
          <input
            type="number"
            name="wastageQuantity"
            value={newInventory.wastageQuantity}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Availability:</label>
          <select
            name="availability"
            value={newInventory.availability}
            onChange={handleChange}
          >
            <option value={true}>In Stock</option>
            <option value={false}>Out of Stock</option>
          </select>
        </div>
        
        <div className="form-section">
          <h3>Stock Management</h3>
          <div>
            <label>Reorder Threshold:</label>
            <input
              type="number"
              name="reorderThreshold"
              value={newInventory.reorderThreshold}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          <div>
            <label>Optimal Stock Level:</label>
            <input
              type="number"
              name="optimalStockLevel"
              value={newInventory.optimalStockLevel}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          <div>
            <label>Lead Time (days):</label>
            <input
              type="number"
              name="leadTime"
              value={newInventory.leadTime}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          <div>
            <label>Auto Reorder:</label>
            <select
              name="autoReorder"
              value={newInventory.autoReorder}
              onChange={handleChange}
            >
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Supplier Information</h3>
          <div>
            <label>Supplier Name:</label>
            <input
              type="text"
              name="supplier.name"
              value={newInventory.supplier.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Supplier Contact:</label>
            <input
              type="text"
              name="supplier.contact"
              value={newInventory.supplier.contact}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Supplier Email:</label>
            <input
              type="email"
              name="supplier.email"
              value={newInventory.supplier.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Supplier Address:</label>
            <input
              type="text"
              name="supplier.address"
              value={newInventory.supplier.address}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit">Add Item</button>
      </form>
    </div>
  );
};

export default AddInventory;