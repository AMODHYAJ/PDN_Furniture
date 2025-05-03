// DeleteInventory.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const DeleteInventory = () => {
  const [inventoryItem, setInventoryItem] = useState(null);
  const { id } = useParams(); // Getting the ID from the URL
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000/inventory';

  // Fetch the inventory item details by ID
  useEffect(() => {
    const fetchInventoryItem = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/${id}`);
        setInventoryItem(data); // Set the fetched data to the state
      } catch (error) {
        console.error('Error fetching inventory item:', error);
      }
    };
    fetchInventoryItem();
  }, [id]);

  // Handle delete action
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${id}`); // Send the delete request to the server
      navigate('/'); // Redirect back to the dashboard after deleting
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    navigate('/'); // Redirect to the dashboard without deleting
  };

  // Display the confirmation UI
  if (!inventoryItem) {
    return <p>Loading...</p>; // If the item is still loading, show a loading state
  }

  return (
    <div className="delete-inventory-container">
      <h2>Are you sure you want to delete this inventory item?</h2>
      <div>
        <p><strong>Material Name:</strong> {inventoryItem.materialName}</p>
        <p><strong>Quantity:</strong> {inventoryItem.quantity}</p>
        <p><strong>Unit:</strong> {inventoryItem.unit}</p>
        <p><strong>Wastage Quantity:</strong> {inventoryItem.wastageQuantity}</p>
        <p><strong>Availability:</strong> {inventoryItem.availability ? 'In Stock' : 'Out of Stock'}</p>
      </div>

      <button onClick={handleDelete}>Delete</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
};

export default DeleteInventory;