import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { getUserById, updateUser } from "../Services/userService";
import "./UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        // Use the ID from URL params or from localStorage
        const userId = id || localStorage.getItem("userId");
        if (!userId) {
          navigate("/login");
          return;
        }

        const userData = await getUserById(userId);
        setUser(userData);
        setFormData({
          name: userData.name,
          email: userData.email,
          password: "",
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        navigate("/login");
      }
    };

    fetchUserProfile();
  }, [navigate, isAuthenticated, id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = id || localStorage.getItem("userId");
      await updateUser(userId, formData);
      alert("Profile updated successfully!");
      
      // Update local user data if editing own profile
      if (!id || id === localStorage.getItem("userId")) {
        const updatedUser = await getUserById(userId);
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      setEditMode(false);
    } catch (error) {
      alert("Failed to update profile.");
      console.error("Update error:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>

      {user && !editMode && (
        <div className="profile-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      )}

      {editMode && (
        <form className="profile-form" onSubmit={handleSubmit}>
          <label>
            Name:
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </label>
          <label>
            Email:
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <label>
            New Password:
            <input type="password" name="password" value={formData.password} onChange={handleChange} />
          </label>
          <div className="form-buttons">
            <button type="submit">Update</button>
            <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserProfile;