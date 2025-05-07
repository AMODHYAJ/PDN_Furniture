import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DiscountManager.css";

const DiscountManager = ({ onClose }) => {
  const [discounts, setDiscounts] = useState([]);
  const [productId, setProductId] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDiscounts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/discount");
        if (!response.ok) {
          throw new Error("Failed to fetch discounts");
        }
        const data = await response.json();
        setDiscounts(data);
      } catch (error) {
        console.error("Error fetching discounts:", error);
        setError("Error fetching discounts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscounts();
  }, []);

  const handleAddDiscount = async () => {
    if (!productId || !discountPercentage || !startDate || !endDate) {
      setError("Please fill out all fields.");
      return;
    }

    if (discountPercentage <= 0 || discountPercentage > 100) {
      setError("Discount percentage must be between 1 and 100.");
      return;
    }

    const discountData = {
      productId,
      discountPercentage,
      startDate,
      endDate,
    };

    setIsLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/discount/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discountData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setDiscounts((prevDiscounts) => [...prevDiscounts, result]);
        setError("");
        setProductId("");
        setDiscountPercentage("");
        setStartDate("");
        setEndDate("");
      } else {
        setError("Failed to add discount. Please try again.");
      }
    } catch (error) {
      console.error("Error adding discount:", error);
      setError("Error adding discount. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDiscount = async (discountId) => {
    if (!window.confirm("Are you sure you want to delete this discount?"))
      return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/discount/delete/${discountId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setDiscounts(
          discounts.filter((discount) => discount._id !== discountId)
        );
        if (selectedDiscount?._id === discountId) {
          setSelectedDiscount(null);
          setProductId("");
          setDiscountPercentage("");
          setStartDate("");
          setEndDate("");
        }
      } else {
        setError("Failed to delete discount. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting discount:", error);
      setError("Error deleting discount. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDiscount = async () => {
    if (!selectedDiscount) return;

    if (!productId || !discountPercentage || !startDate || !endDate) {
      setError("Please fill out all fields.");
      return;
    }

    if (discountPercentage <= 0 || discountPercentage > 100) {
      setError("Discount percentage must be between 1 and 100.");
      return;
    }

    const discountData = {
      productId,
      discountPercentage,
      startDate,
      endDate,
    };

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/discount/update/${selectedDiscount._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discountData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setDiscounts(
          discounts.map((discount) =>
            discount._id === selectedDiscount._id
              ? result.updatedDiscount
              : discount
          )
        );
        setSelectedDiscount(null);
        setError("");
        setProductId("");
        setDiscountPercentage("");
        setStartDate("");
        setEndDate("");
      } else {
        setError("Failed to update discount. Please try again.");
      }
    } catch (error) {
      console.error("Error updating discount:", error);
      setError("Error updating discount. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (discount) => {
    setSelectedDiscount(discount);
    setProductId(discount.productId);
    setDiscountPercentage(discount.discountPercentage);
    setStartDate(discount.startDate.split("T")[0]);
    setEndDate(discount.endDate.split("T")[0]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setSelectedDiscount(null);
    setProductId("");
    setDiscountPercentage("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="discount-manager">
      <h1>Manage Discounts</h1>

      {error && <p className="discount-error">{error}</p>}

      <div className="discount-form-section">
        <h3>{selectedDiscount ? "Update Discount" : "Add New Discount"}</h3>

        <label className="discount-input-label">Product ID</label>
        <input
          type="text"
          placeholder="Enter product ID"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
        />

        <label className="discount-input-label">Discount Percentage</label>
        <input
          type="number"
          placeholder="1-100%"
          min="1"
          max="100"
          value={discountPercentage}
          onChange={(e) => setDiscountPercentage(e.target.value)}
        />

        <label className="discount-input-label">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label className="discount-input-label">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <div className="discount-button-container">
          <button
            className="discount-primary-button"
            onClick={
              selectedDiscount ? handleUpdateDiscount : handleAddDiscount
            }
            disabled={isLoading}
          >
            {isLoading
              ? "Processing..."
              : selectedDiscount
              ? "Update Discount"
              : "Add Discount"}
          </button>
          {selectedDiscount && (
            <button className="discount-secondary-button" onClick={handleCancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="discount-list-section">
        <h3>Current Discounts</h3>
        {isLoading && discounts.length === 0 ? (
          <p>Loading discounts...</p>
        ) : discounts.length === 0 ? (
          <p className="discount-empty-state">No active discounts</p>
        ) : (
          <ul>
            {discounts.map((discount) => (
              <li key={discount._id}>
                <div className="discount-info">
                  <div>
                    <strong>Product ID:</strong> {discount.productId}
                  </div>
                  <div>
                    <strong>Discount:</strong> {discount.discountPercentage}%
                  </div>
                  <div className="discount-date-range">
                    <strong>Valid:</strong>{" "}
                    {new Date(discount.startDate).toLocaleDateString()} -{" "}
                    {new Date(discount.endDate).toLocaleDateString()}
                  </div>
                </div>
                <div className="discount-actions">
                  <button
                    className="discount-secondary-button"
                    onClick={() => handleEditClick(discount)}
                  >
                    Edit
                  </button>
                  <button
                    className="discount-delete-button"
                    onClick={() => handleDeleteDiscount(discount._id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        className="discount-secondary-button"
        onClick={() => navigate("/admin/products")}
        style={{ marginTop: "2rem" }}
      >
        Back to Products
      </button>
    </div>
  );
};

export default DiscountManager;
