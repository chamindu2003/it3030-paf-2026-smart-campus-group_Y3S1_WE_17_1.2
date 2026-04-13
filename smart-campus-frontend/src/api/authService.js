import { authAPI } from './apiService';

/**
 * Authentication Service
 * Handles login, logout, and session management
 */

class AuthService {
  /**
   * Login user and store authentication data
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User data with token
   */
  async login(email, password) {
    try {
      const response = await authAPI.login(email, password);

      // Store token and user data
      authAPI.setAuthData(response.token, response);
      localStorage.setItem('userEmail', email);

      return response;
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Register new user
   * @param {string} name - User full name
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role (default: 'USER')
   * @returns {Promise<Object>} - New user data
   */
  async register(name, email, password, role = 'USER') {
    try {
      const response = await authAPI.register(name, email, password, role);
      return response;
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Logout user and clear session
   */
  logout() {
    authAPI.logout();
  }

  /**
   * Check if user is currently logged in
   * @returns {boolean} - True if user is authenticated
   */
  isLoggedIn() {
    return authAPI.isAuthenticated();
  }

  /**
   * Get current user data
   * @returns {Object|null} - Current user object or null
   */
  getCurrentUser() {
    return authAPI.getUser();
  }

  /**
   * Get current auth token
   * @returns {string|null} - JWT token or null
   */
  getToken() {
    return authAPI.getToken();
  }

  /**
   * Refresh authentication state
   * (Call this when component mounts to check if user is still logged in)
   * @returns {Object|null} - Current user if logged in, null otherwise
   */
  refreshAuth() {
    if (this.isLoggedIn()) {
      return this.getCurrentUser();
    }
    return null;
  }
}

// Export singleton instance
const authService = new AuthService();

export default authService;

