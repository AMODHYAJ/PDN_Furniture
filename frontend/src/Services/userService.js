import api from '../utils/api';

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data.users;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Admin privileges required');
    }
    throw new Error('Failed to fetch users');
  }
};

// Add a new user (admin only)
export const addUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return response.data.user;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Admin privileges required');
    }
    throw new Error('Failed to add user');
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data.user;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Unauthorized access');
    }
    throw new Error('Failed to fetch user');
  }
};

// Update user
export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/users/${id}`, userData);
    return response.data.user;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Unauthorized access');
    }
    throw new Error('Failed to update user');
  }
};

// Delete user (admin only)
export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Session expired. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Admin privileges required');
    }
    throw new Error('Failed to delete user');
  }
};