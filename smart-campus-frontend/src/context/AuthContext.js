import React, { createContext, useState, useCallback, useEffect } from 'react';
import authService from '../api/authService';

/**
 * AuthContext
 * Provides global authentication state and methods
 */
export const AuthContext = createContext();

/**
 * AuthProvider Component
 * Wraps the app to provide authentication context
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize auth state from localStorage on mount
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken) {
          setToken(storedToken);
        }

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Failed to parse stored user:', e);
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Response data with user info
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password);

      // Extract token from response (handle multiple formats)
      const newToken = response?.token || response?.jwt || response?.accessToken;

      if (newToken) {
        setToken(newToken);
        localStorage.setItem('token', newToken);
      }

      // Set user data
      setUser(response);
      localStorage.setItem('user', JSON.stringify(response));

      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      console.error('Login error:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register new user
   * @param {string} name - User full name
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role
   * @returns {Promise<Object>} - Response data with user info
   */
  const register = useCallback(async (name, email, password, role = 'USER') => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(name, email, password, role);

      // Extract token from response
      const newToken = response?.token || response?.jwt || response?.accessToken;

      if (newToken) {
        setToken(newToken);
        localStorage.setItem('token', newToken);
      }

      // Set user data
      setUser(response);
      localStorage.setItem('user', JSON.stringify(response));

      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user and clear session
   */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');

    // Call logout from authService if needed
    try {
      authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  /**
   * Check if user is logged in
   * @returns {boolean}
   */
  const isLoggedIn = useCallback(() => {
    return !!token && !!user;
  }, [token, user]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Set error message manually
   * @param {string} errorMessage - Error message to set
   */
  const setErrorMessage = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);

  /**
   * Update user data
   * @param {Object} userData - New user data
   */
  const updateUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  /**
   * Context value
   */
  const value = {
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated: isLoggedIn(),

    // Methods
    login,
    register,
    logout,
    isLoggedIn,
    clearError,
    setError: setErrorMessage,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

