import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "./UpdateInventory.css";

const UpdateInventory = () => {
  const [inventoryItem, setInventoryItem] = useState({
    materialName: '',
    quantity: '',
    unit: '',
    wastageQuantity: '',
    availability: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  const API_URL = `http://localhost:5000/inventory/${id}`; // Fixed: using backticks

  // Fetch the current inventory item data
  useEffect(() => {
    const fetchInventoryItem = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(API_URL);
        setInventoryItem(data.inventoryItem || {
          materialName: '',
          quantity: '',
          unit: '',
          wastageQuantity: '',
          availability: true
        }); 
      } catch (err) {
        console.error('Error fetching inventory item:', err);
        setError('Failed to load inventory item');
      } finally {
        setLoading(false);
      }
    };
    fetchInventoryItem();
  }, [id]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setInventoryItem(prev => ({
      ...prev,
      [name]: type === 'select-one' ? value === 'true' : value
    }));
  };

  // Handle form submission to update the inventory item
  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(API_URL, inventoryItem); 
      navigate('/admin/inventory'); // Redirect to inventory list
    } catch (error) {
      console.error('Error updating inventory item:', error);
      setError('Failed to update inventory item');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="update-inventory-container">
      <h2>Update Inventory Item</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleUpdateInventory}>
        <div className="form-group">
          <label>Material Name:</label>
          <input
            type="text"
            name="materialName"
            value={inventoryItem.materialName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Quantity:</label>
          <input
            type="number"
            name="quantity"
            value={inventoryItem.quantity}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label>Unit:</label>
          <input
            type="text"
            name="unit"
            value={inventoryItem.unit}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Wastage Quantity:</label>
          <input
            type="number"
            name="wastageQuantity"
            value={inventoryItem.wastageQuantity}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label>Availability:</label>
          <select
            name="availability"
            value={inventoryItem.availability}
            onChange={handleChange}
          >
            <option value={true}>In Stock</option>
            <option value={false}>Out of Stock</option>
          </select>
        </div>
        <button type="submit" className="update-button" disabled={loading}>
          {loading ? 'Updating...' : 'Update Item'}
        </button>
      </form>
    </div>
  );
};

export default UpdateInventory;