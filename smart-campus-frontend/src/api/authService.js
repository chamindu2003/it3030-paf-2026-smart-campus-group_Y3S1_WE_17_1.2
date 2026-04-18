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
      console.log('[Email Login] Starting login for:', email);
      const response = await axiosInstance.post('/auth/login', { email, password });
      const responseData = response.data;
      console.log('[Email Login] ✓ Response received:', response.status);
      console.log('[Email Login] Response data:', responseData);
      
      const token = responseData?.token || responseData?.jwt || responseData?.accessToken;

      // Store JWT token if present in the login response
      if (token) {
        console.log('[Email Login] ✓ Token found, storing in localStorage');
        localStorage.setItem('token', token);
      } else {
        console.warn('[Email Login] ⚠ Warning: No token in response');
      }

      // Preserve existing session metadata behavior
      localStorage.setItem('user', JSON.stringify(responseData));
      localStorage.setItem('userEmail', email);
      console.log('[Email Login] ✓ User data stored successfully');

      return responseData;
    } catch (error) {
      console.error('[Email Login] ✗ Login failed');
      console.error('  - Status:', error.response?.status);
      console.error('  - Message:', error.response?.data?.message || error.message);
      console.error('  - Full error:', error.response?.data || error.message);
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
    console.log('[authService] Clearing all authentication data');
    
    // Clear all auth-related localStorage
    const authKeys = ['token', 'user', 'userEmail', 'googleToken', 'gToken', 'currentUser', 'fullName', 'role', 'studentId'];
    authKeys.forEach(item => {
      if (localStorage.getItem(item)) {
        localStorage.removeItem(item);
        console.log('[authService] Cleared:', item);
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
        console.log('[authService] Cleared (wildcard):', key);
      }
    });

    // Clear sessionStorage
    sessionStorage.clear();
    console.log('[authService] SessionStorage cleared');
    
    // Call authAPI logout
    authAPI.logout();
    console.log('[authService] Auth data cleared');

    // Verify localStorage is empty
    console.log('[authService] Remaining localStorage after cleanup:', localStorage.length, 'items');
  }

  /**
   * OAuth 2.0 Login with Google
   * @param {string} idToken - Google ID token from Google Sign-In
   * @returns {Promise<Object>} - User data with JWT token
   */
  async loginWithGoogle(idToken) {
    try {
      console.log('[Google Login] Starting with token length:', idToken?.length);

      if (!idToken) {
        throw new Error('No ID token provided to loginWithGoogle');
      }

      console.log('[Google Login] Sending request to /auth/google/login');
      const response = await axiosInstance.post('/auth/google/login', {
        idToken,
        provider: 'google'
      });

      console.log('[Google Login] ✓ Response received:', response.status);
      const responseData = response.data;
      console.log('[Google Login] Response data:', responseData);
      
      const token = responseData?.token || responseData?.jwt || responseData?.accessToken;

      // Validate token
      if (!token) {
        console.error('[Google Login] ✗ No token in response');
        throw new Error('No token received from server');
      }

      console.log('[Google Login] ✓ Token received, storing in localStorage');
      // Store JWT token
      localStorage.setItem('token', token);

      // Store user data
      localStorage.setItem('user', JSON.stringify(responseData));
      console.log('[Google Login] ✓ User data stored successfully');

      return responseData;
    } catch (error) {
      console.error('[Google Login] ✗ Error occurred:');
      console.error('  Status:', error.response?.status);
      console.error('  Data:', error.response?.data);
      console.error('  Message:', error.message);

      // Create a more informative error message
      let errorMessage = 'Google login failed. ';
      if (error.response?.status === 401) {
        errorMessage += 'Unauthorized: ' + (error.response?.data?.message || 'Invalid credentials.');
      } else if (error.response?.status === 400) {
        errorMessage += 'Invalid request: ' + (error.response?.data?.message || 'Please check your input.');
      } else if (error.response?.status === 500) {
        errorMessage += 'Server error: ' + (error.response?.data?.message || 'Please try again later.');
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else {
        errorMessage += error.message || 'Please try again.';
      }

      console.error('[Google Login] Final error:', errorMessage);
      const finalError = new Error(errorMessage);
      throw finalError;
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

