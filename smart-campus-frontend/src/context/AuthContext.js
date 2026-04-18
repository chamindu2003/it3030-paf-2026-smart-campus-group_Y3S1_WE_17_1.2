import React, { createContext, useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import authService from '../api/authService';
import axiosInstance from '../api/axiosInstance';

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
    console.log('[AuthContext] Logout initiated');
    
    // Clear state
    setUser(null);
    setToken(null);
    setError(null);
    setLoading(false);

    // List of specific auth-related keys to clear
    const authKeys = ['token', 'user', 'userEmail', 'googleToken', 'gToken', 'currentUser', 'fullName', 'role', 'studentId'];
    authKeys.forEach(item => {
      if (localStorage.getItem(item)) {
        localStorage.removeItem(item);
        console.log('[AuthContext] Cleared localStorage:', item);
      }
    });

    // Get all keys first (to avoid iterator issues), then remove them
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      allKeys.push(localStorage.key(i));
    }

    // Clear any remaining auth-related items (wildcard matching)
    allKeys.forEach(key => {
      if (key && (key.includes('google') || key.includes('auth') || key.includes('user') || key.includes('token') || key.includes('playnow') || key.includes('role') || key.includes('id'))) {
        localStorage.removeItem(key);
        console.log('[AuthContext] Cleared localStorage (wildcard):', key);
      }
    });

    // Call logout from authService to clear any cached credentials
    try {
      authService.logout();
      console.log('[AuthContext] AuthService logout called');
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
    }

    // Clear axios headers
    delete axiosInstance.defaults.headers.common['Authorization'];
    console.log('[AuthContext] Axios Authorization header cleared');

    // Also clear sessionStorage for Google caching
    sessionStorage.clear();
    console.log('[AuthContext] SessionStorage cleared');

    // Verify localStorage is empty (debugging)
    console.log('[AuthContext] Remaining localStorage items after cleanup:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log('  - ' + key + ':', localStorage.getItem(key)?.substring(0, 50) + '...');
    }
    
    if (localStorage.length === 0) {
      console.log('[AuthContext] ✓ localStorage is completely empty');
    } else {
      console.warn('[AuthContext] ⚠ WARNING: localStorage still has', localStorage.length, 'items');
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
  const value = useMemo(() => ({
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
  }), [user, token, loading, error, isLoggedIn, login, register, logout, clearError, setErrorMessage, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;

