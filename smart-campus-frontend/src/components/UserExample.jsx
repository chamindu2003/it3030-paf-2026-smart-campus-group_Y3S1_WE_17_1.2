import React, { useState, useEffect } from 'react';
import UserService from '../api/userService';

/**
 * Example component showing how to use the axios instance
 * and UserService to interact with the backend API
 */
const UserExample = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch user data on component mount
   */
  useEffect(() => {
    fetchUser();
  }, []);

  /**
   * Fetch user information
   * The JWT token is automatically included in the request
   */
  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.getUser();
      setUser(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user login
   */
  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.login({ email, password });
      // Store JWT token in localStorage
      localStorage.setItem('token', response.data.token);
      // Optionally store user info
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user registration
   */
  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await UserService.register(userData);
      setUser(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div>
      <h2>User Example</h2>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {user ? (
        <div>
          <h3>Welcome, {user.name}</h3>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Please login or register</p>
          <button
            onClick={() =>
              handleLogin('admin@example.com', 'admin123')
            }
          >
            Login as Admin
          </button>
        </div>
      )}
    </div>
  );
};

export default UserExample;

