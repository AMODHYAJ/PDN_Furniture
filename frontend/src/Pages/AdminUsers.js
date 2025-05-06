import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { getAllUsers, deleteUser, updateUser } from "../Services/userService";
import "./AdminUsers.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "Customer"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const usersData = await getAllUsers();
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        if (err.message.includes('Session expired')) {
          navigate('/login');
        }
      }
    };

    fetchUsers();
  }, [isAdmin, navigate]);

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        setError(err.message);
        if (err.message.includes('Session expired')) {
          navigate('/login');
        }
      }
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user._id);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUser(editUserId, editFormData);
      setUsers(users.map(user => 
        user._id === editUserId ? updatedUser : user
      ));
      setEditUserId(null);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Session expired')) {
        navigate('/login');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="luxury-loading">
      <div className="luxury-spinner"></div>
      <p>Loading user data...</p>
    </div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="luxury-admin-users">
      <div className="luxury-header">
        <h1 className="luxury-title">User Management</h1>
        <div className="luxury-divider"></div>
      </div>
      
      {error && <div className="luxury-error">{error}</div>}
      
      <div className="luxury-search-container">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="luxury-search-input"
        />
        <span className="luxury-search-icon">🔍</span>
      </div>
      
      <div className="luxury-table-container">
        <table className="luxury-users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Member Since</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <tr key={user._id} className="luxury-table-row">
                  {editUserId === user._id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditChange}
                          className="luxury-edit-input"
                        />
                      </td>
                      <td>
                        <input
                          type="email"
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditChange}
                          className="luxury-edit-input"
                        />
                      </td>
                      <td>
                        <select
                          name="role"
                          value={editFormData.role}
                          onChange={handleEditChange}
                          className="luxury-edit-select"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Customer">Customer</option>
                        </select>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="luxury-action-buttons">
                        <button 
                          className="luxury-btn luxury-save-btn"
                          onClick={handleEditSubmit}
                        >
                          Save
                        </button>
                        <button 
                          className="luxury-btn luxury-cancel-btn"
                          onClick={() => setEditUserId(null)}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="luxury-user-name">{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`luxury-role-tag ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="luxury-action-buttons">
                        <button 
                          className="luxury-btn luxury-edit-btn"
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button 
                          className="luxury-btn luxury-delete-btn"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr className="luxury-empty-row">
                <td colSpan="5" className="luxury-no-users">
                  <div className="luxury-empty-state">
                    <span className="luxury-empty-icon">👤</span>
                    <p>No users found matching your search</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;