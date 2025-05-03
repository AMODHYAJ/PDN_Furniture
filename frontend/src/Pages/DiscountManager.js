import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DiscountManager.css';

const DiscountManager = ({ onClose }) => {
  const [discounts, setDiscounts] = useState([]);
  const [productId, setProductId] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/discount');
        if (!response.ok) {
          throw new Error('Failed to fetch discounts');
        }
        const data = await response.json();
        setDiscounts(data);
      } catch (error) {
        console.error('Error fetching discounts:', error);
        setError('Error fetching discounts');
      }
    };

    fetchDiscounts();
  }, []);

  //discount validations
  const handleAddDiscount = async () => {
    if (!productId || !discountPercentage || !startDate || !endDate) {
      setError('Please fill out all fields.');
      alert('Please fill out all fields.');
      return;
    }

    if (discountPercentage <= 0 || discountPercentage > 100) {
      setError('Discount percentage must be between 1 and 100.');
      alert('Discount percentage must be between 1 and 100.');
      return;
    }

    const discountData = {
      productId,
      discountPercentage,
      startDate,
      endDate,
    };

    try {
      const response = await fetch('http://localhost:5000/api/discount/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discountData),
      });

      if (response.ok) {
        const result = await response.json();
        setDiscounts((prevDiscounts) => [...prevDiscounts, result]);
        setError('');
        alert('Discount added successfully!');
      } else {
        setError('Failed to add discount. Please try again.');
        alert('Failed to add discount. Please try again.');
      }
    } catch (error) {
      console.error('Error adding discount:', error);
      setError('Error adding discount. Please try again.');
      alert('Error adding discount. Please try again.');
    }
  };

  const handleDeleteDiscount = async (discountId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/discount/delete/${discountId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDiscounts(discounts.filter((discount) => discount._id !== discountId));
        alert('Discount deleted successfully!');
      } else {
        setError('Failed to delete discount. Please try again.');
        alert('Failed to delete discount. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      setError('Error deleting discount. Please try again.');
      alert('Error deleting discount. Please try again.');
    }
  };

  const handleUpdateDiscount = async () => {
    if (!selectedDiscount) return;

    if (!productId || !discountPercentage || !startDate || !endDate) {
      setError('Please fill out all fields.');
      alert('Please fill out all fields.');
      return;
    }

    if (discountPercentage <= 0 || discountPercentage > 100) {
      setError('Discount percentage must be between 1 and 100.');
      alert('Discount percentage must be between 1 and 100.');
      return;
    }

    const discountData = {
      productId,
      discountPercentage,
      startDate,
      endDate,
    };

    try {
      const response = await fetch(`http://localhost:5000/api/discount/update/${selectedDiscount._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discountData),
      });

      if (response.ok) {
        const result = await response.json();
        setDiscounts(
          discounts.map((discount) =>
            discount._id === selectedDiscount._id ? result.updatedDiscount : discount
          )
        );
        setSelectedDiscount(null);
        setError('');
        alert('Discount updated successfully!');
      } else {
        setError('Failed to update discount. Please try again.');
        alert('Failed to update discount. Please try again.');
      }
    } catch (error) {
      console.error('Error updating discount:', error);
      setError('Error updating discount. Please try again.');
      alert('Error updating discount. Please try again.');
    }
  };

  // Navigate to the admin dashboard when closing
  const handleClose = () => {
    navigate('/'); // Change to your admin dashboard route
  };

  return (
    <div className="discount-manager">
      <h1>Manage Discounts</h1>

      {error && <p className="error">{error}</p>}

      <div>
        <h3>{selectedDiscount ? 'Update Discount' : 'Add New Discount'}</h3>
        <label className="input-label">Product ID</label>
        <input
          type="text"
          placeholder="Product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />
        <label className="input-label">Discount Percentage</label>
        <input
          type="number"
          placeholder="Discount Percentage"
          value={discountPercentage}
          onChange={(e) => setDiscountPercentage(e.target.value)}
        />
        <label className="input-label">Start Date</label>
        <input
          type="date"
          placeholder="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label className="input-label">End Date</label>
        <input
          type="date"
          placeholder="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={selectedDiscount ? handleUpdateDiscount : handleAddDiscount}>
          {selectedDiscount ? 'Update Discount' : 'Add Discount'}
        </button>
      </div>

      <div>
        <h3>Existing Discounts</h3>
        {discounts.length === 0 ? (
          <p>No discounts available.</p>
        ) : (
          <ul>
            {discounts.map((discount) => (
              <li key={discount._id}>
                <div>
                  <strong>Product ID:</strong> {discount.productId}
                  <div className="discount-info">
                    <strong>Discount:</strong> {discount.discountPercentage}% |{' '}
                    <strong>Valid:</strong> {discount.startDate} to {discount.endDate}
                  </div>
                </div>
                <div>
                  <button onClick={() => setSelectedDiscount(discount)}>Edit</button>
                  <button className="delete" onClick={() => handleDeleteDiscount(discount._id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={handleClose}>Close</button>
    </div>
  );
};

export default DiscountManager;