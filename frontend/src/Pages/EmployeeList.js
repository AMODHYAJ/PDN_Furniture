import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api"; // Use configured axios instance
import "./EmployeeList.css";
import ProgressNavBar from "../Components/ProgressNavBar";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get("/employees");
        setEmployees(response.data);
        setFilteredEmployees(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    let result = employees;

    // Apply search filter
    if (searchTerm) {
      result = result.filter((employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "All") {
      result = result.filter((employee) => employee.role === roleFilter);
    }

    setFilteredEmployees(result);
  }, [searchTerm, roleFilter, employees]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await api.delete(`/employees/${id}`);
        setEmployees(employees.filter((emp) => emp._id !== id));
        alert("Employee deleted successfully!");
      } catch (err) {
        alert("Failed to delete employee");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const getUniqueRoles = () => {
    const roles = new Set(employees.map((employee) => employee.role));
    return ["All", ...Array.from(roles)];
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <ProgressNavBar />
      <div className="employee-list-container">
        <h2>Employee Management</h2>
        <Link to="/employees/add" className="add-employee-btn">
          Add New Employee
        </Link>

        <div className="filters-container">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="role-filter">
            <select value={roleFilter} onChange={handleRoleFilterChange}>
              {getUniqueRoles().map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="employee-grid">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <div key={employee._id} className="employee-card">
                <div className="employee-image">
                  {employee.image ? (
                    <img
                      src={`http://localhost:5000${employee.image}`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "path/to/placeholder.jpg";
                      }}
                      alt={employee.name}
                    />
                  ) : (
                    <div className="placeholder-image">
                      {employee.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="employee-details">
                  <h3>{employee.name}</h3>
                  <p>
                    <strong>Role:</strong> {employee.role}
                  </p>
                  <p>
                    <strong data-status={employee.status}>Status:</strong>{" "}
                    {employee.status}
                  </p>
                  <p>
                    <strong>Phone:</strong> {employee.phone}
                  </p>
                  <div className="employee-actions">
                    <Link
                      to={`/employees/edit/${employee._id}`}
                      className="edit-btn"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              No employees found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EmployeeList;
