//AddInventory.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import './AddInventory.css';

const AddInventory = () => {
  const [newInventory, setNewInventory] = useState({
    materialName: '',
    quantity: '',
    unit: '',
    wastageQuantity: '',
    availability: true,
  });

  const [error, setError] = useState(''); // error messages
  const [success, setSuccess] = useState(''); // success messages
  const navigate = useNavigate(); 
  const API_URL = 'http://localhost:5000/inventory';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewInventory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate the form data before submitting
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
    return ''; 
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    const validationError = validateForm(); // Perform validation
    if (validationError) {
      setError(validationError); // Show error if validation fails
      setSuccess(''); // Clear success message if validation fails
      return;
    }

    try {
      await axios.post(API_URL, newInventory);
      setSuccess('Item added successfully!'); // Set success message
      setError(''); // Clear any previous error message
      setNewInventory({ // Reset form fields
        materialName: '',
        quantity: '',
        unit: '',
        wastageQuantity: '',
        availability: true,
      });
      setTimeout(() => {
        setSuccess(''); // Clear success message after a few seconds
      }, 3000);
      navigate('/'); // Redirect back to the Dashboard after adding the item
    } catch (error) {
      console.error('Error adding inventory:', error);
      setError('Error adding inventory. Please try again later.');
      setSuccess(''); // Clear success message on error
    }
  };

  return (
    <div className="add-inventory-container">
      <h2>Add New Inventory Item</h2>

      {/* Display error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Display success message */}
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
        <button type="submit">Add Item</button>
      </form>
    </div>
  );
};

export default AddInventory;