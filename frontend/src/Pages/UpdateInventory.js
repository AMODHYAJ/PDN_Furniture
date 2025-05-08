import React, { useState, useEffect } from 'react';
import api from "../utils/api";
import { useParams, useNavigate } from 'react-router-dom';
import "./UpdateInventory.css";

const UpdateInventory = () => {
  const [inventoryItem, setInventoryItem] = useState({
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const API_URL = `/inventory/${id}`;

  useEffect(() => {
    const API_URL = `/inventory/${id}`; 

    const fetchInventoryItem = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(API_URL);
        setInventoryItem(data.inventoryItem || {
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
      } catch (err) {
        console.error('Error fetching inventory item:', err);
        setError('Failed to load inventory item');
      } finally {
        setLoading(false);
      }
    };
    fetchInventoryItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('supplier.')) {
      const supplierField = name.split('.')[1];
      setInventoryItem(prev => ({
        ...prev,
        supplier: {
          ...prev.supplier,
          [supplierField]: value
        }
      }));
    } else {
      setInventoryItem(prev => ({
        ...prev,
        [name]: name === 'autoReorder' || name === 'availability' 
          ? value === 'true' 
          : value
      }));
    }
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put(API_URL, inventoryItem);
      navigate('/admin/inventory');
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

        <div className="form-section">
          <h3>Stock Management</h3>
          <div className="form-group">
            <label>Reorder Threshold:</label>
            <input
              type="number"
              name="reorderThreshold"
              value={inventoryItem.reorderThreshold}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Optimal Stock Level:</label>
            <input
              type="number"
              name="optimalStockLevel"
              value={inventoryItem.optimalStockLevel}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Lead Time (days):</label>
            <input
              type="number"
              name="leadTime"
              value={inventoryItem.leadTime}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Auto Reorder:</label>
            <select
              name="autoReorder"
              value={inventoryItem.autoReorder}
              onChange={handleChange}
            >
              <option value={false}>No</option>
              <option value={true}>Yes</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h3>Supplier Information</h3>
          <div className="form-group">
            <label>Supplier Name:</label>
            <input
              type="text"
              name="supplier.name"
              value={inventoryItem.supplier?.name || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Supplier Contact:</label>
            <input
              type="text"
              name="supplier.contact"
              value={inventoryItem.supplier?.contact || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Supplier Email:</label>
            <input
              type="email"
              name="supplier.email"
              value={inventoryItem.supplier?.email || ''}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Supplier Address:</label>
            <input
              type="text"
              name="supplier.address"
              value={inventoryItem.supplier?.address || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <button type="submit" className="update-button" disabled={loading}>
          {loading ? 'Updating...' : 'Update Item'}
        </button>
      </form>
    </div>
  );
};

export default UpdateInventory;