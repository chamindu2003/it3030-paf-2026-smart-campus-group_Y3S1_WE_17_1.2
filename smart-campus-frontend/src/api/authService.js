import { authAPI } from './apiService';
import axiosInstance from './axiosInstance';

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
      const response = await axiosInstance.post('/auth/login', { email, password });
      const responseData = response.data;
      const token = responseData?.token || responseData?.jwt || responseData?.accessToken;

      // Store JWT token if present in the login response
      if (token) {
        localStorage.setItem('token', token);
      }

      // Preserve existing session metadata behavior
      localStorage.setItem('user', JSON.stringify(responseData));
      localStorage.setItem('userEmail', email);

      return responseData;
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
   * OAuth 2.0 Login with Google
   * @param {string} idToken - Google ID token from Google Sign-In
   * @returns {Promise<Object>} - User data with JWT token
   */
  async loginWithGoogle(idToken) {
    try {
      console.log('Starting Google login with token length:', idToken?.length);

      if (!idToken) {
        throw new Error('No ID token provided');
      }

      console.log('Calling backend /auth/google/login endpoint...');
      const response = await axiosInstance.post('/auth/google/login', {
        idToken,
        provider: 'google'
      });

      console.log('Backend response received:', response.status);
      const responseData = response.data;
      const token = responseData?.token || responseData?.jwt || responseData?.accessToken;

      // Validate token
      if (!token) {
        throw new Error('No token received from server');
      }

      console.log('Token received, storing in localStorage...');
      // Store JWT token
      localStorage.setItem('token', token);

      // Store user data
      localStorage.setItem('user', JSON.stringify(responseData));
      console.log('Google login successful, user stored');

      return responseData;
    } catch (error) {
      console.error('Google login failed - Full error:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);

      // Create a more informative error message
      let errorMessage = 'Google login failed. ';
      if (error.response?.status === 401) {
        errorMessage += 'Unauthorized. Please check your credentials.';
      } else if (error.response?.status === 400) {
        errorMessage += 'Invalid request. ' + (error.response?.data?.message || '');
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += error.message;
      }

      throw new Error(errorMessage);
    }
  }

  /**
   * Generic OAuth 2.0 Login method
   * @param {string} provider - OAuth provider name (e.g., 'google')
   * @param {string} idToken - ID token from OAuth provider
   * @returns {Promise<Object>} - User data with JWT token
   */
  async loginWithOAuth(provider, idToken) {
    try {
      const response = await axiosInstance.post('/auth/oauth2/login', {
        idToken,
        provider
      });
      const responseData = response.data;
      const token = responseData?.token || responseData?.jwt || responseData?.accessToken;

      // Store JWT token
      if (token) {
        localStorage.setItem('token', token);
      }

      // Store user data
      localStorage.setItem('user', JSON.stringify(responseData));

      return responseData;
    } catch (error) {
      console.error(`${provider} login failed:`, error.response?.data || error.message);
      throw error;
    }
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

