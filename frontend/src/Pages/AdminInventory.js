import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "jspdf-autotable";
import "./AdminInventory.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
<link
  href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Montserrat:wght@400;500&display=swap"
  rel="stylesheet"
>
  {" "}
</link>;

const AdminInventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // search input
  const [stockStatus, setStockStatus] = useState(""); // stock filter
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(false); // Refresh state
  const [loading, setLoading] = useState(false); // Loading state
  const itemsPerPage = 6;

  // Fetch the inventory data
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/inventory");
      setInventoryItems(data.inventoryItems || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [refreshTrigger]);

  // Delete action
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this inventory item?"
    );

    if (isConfirmed) {
      try {
        const response = await api.delete(`/inventory/${id}`);
        if (response.status === 200) {
          setInventoryItems((prevItems) =>
            prevItems.filter((item) => item._id !== id)
          );
          alert("Item deleted successfully!");
        } else {
          alert("Error deleting item. Please try again later.");
        }
      } catch (error) {
        console.error("Error deleting inventory item:", error);
        alert("Error deleting item. Please try again later.");
      }
    }
  };

  // Refresh function
  const handleRefresh = () => {
    setRefreshTrigger((prev) => !prev);
    setCurrentPage(1); // Reset to first page on refresh
  };

  // Filter inventory items
  const filteredItems = inventoryItems.filter(
    (item) =>
      (item.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.quantity.toString().includes(searchTerm)) &&
      (stockStatus ? item.availability === (stockStatus === "in-stock") : true)
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Generate CSV report
  const generateCSV = (data) => {
    const header = Object.keys(data[0]).join(","); // Get the header (keys)
    const rows = data.map((row) => Object.values(row).join(",")); // Convert each row into a CSV string
    const csvContent = [header, ...rows].join("\n"); // Combine the header and rows

    return csvContent;
  };

  const downloadCSV = (data, fileName = "inventory_report.csv") => {
    const csv = generateCSV(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.target = "_blank";
    link.download = fileName;
    link.click();
  };

  const generatePDF = async () => {
    try {
      const response = await api.get("api/reports/generate-inventory-report", {
        responseType: "blob", // Expecting a blob for the PDF file
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "InventoryReport.pdf"); // Set download filename
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up
    } catch (error) {
      console.error(
        "Error generating the Inventory PDF report:",
        error.response || error.message
      );
      alert("Failed to generate inventory report");
    }
  };

  // Pie chart data
  const pieChartData = [
    {
      name: "In Stock",
      value: inventoryItems.filter((i) => i.availability).length,
    },
    {
      name: "Out of Stock",
      value: inventoryItems.filter((i) => !i.availability).length,
    },
  ];

  const COLORS = ["#4CAF50", "#FF5722"]; // Green and red

  return (
    <div className="dashboard-container">
      <h2>Inventory List</h2>
      <div className="action-buttons">
        <Link to="/add-inventory">
          <button className="add-item-btn">Add Inventory Item</button>
        </Link>
        <button
          className="refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Combined search and filter container */}
      <div className="search-filter-container">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search by Material Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        {/* Stock Status Filter */}
        <select
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value)}
          className="stock-status-filter"
        >
          <option value="">All Items</option>
          <option value="in-stock">In Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* Add export buttons */}
      <div className="export-buttons">
        <button onClick={() => downloadCSV(filteredItems)}>Download CSV</button>
        <button onClick={generatePDF}>Download PDF</button>
      </div>

      {loading ? (
        <div className="loading-container">
          <p>Loading inventory data...</p>
        </div>
      ) : currentItems.length === 0 ? (
        <p className="no-items-message">No inventory items available.</p>
      ) : (
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Material Name</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Wastage</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={item._id}>
                <td>{item.materialName}</td>
                <td>{item.quantity}</td>
                <td>{item.unit}</td>
                <td>{item.wastageQuantity}</td>
                <td>
                  <span
                    className={`stock-status ${
                      !item.availability
                        ? "out-of-stock"
                        : item.quantity < 5
                        ? "low-stock"
                        : "in-stock"
                    }`}
                  >
                    {item.availability ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="action-buttons-cell">
                  <Link to={`/update-inventory/${item._id}`}>
                    <button className="update-btn">Update</button>
                  </Link>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Stock Analytics Chart */}
      <div className="inventory-chart-container">
        <h2>Stock Analytics</h2>
        <div
          style={{
            width: "100%",
            height: "400px",
            maxWidth: 400,
            margin: "2rem auto",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="pagination-controls">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`page-btn ${currentPage === index + 1 ? "active" : ""}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminInventory;
