import axiosInstance from './axiosInstance';

/**
 * User API Service
 * Handles all user-related API calls
 */
const UserService = {
  /**
   * Get user information
   * @returns {Promise} User data
   */
  getUser: () => {
    return axiosInstance.get('/v1/getUser');
  },

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise} User data
   */
  getUserByEmail: (email) => {
    return axiosInstance.get(`/v1/user/${email}`);
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Response with JWT token
   */
  login: (credentials) => {
    return axiosInstance.post('/v1/login', credentials);
  },

  /**
   * Register new user
   * @param {Object} userData - { name, email, password, role }
   * @returns {Promise} Created user data
   */
  register: (userData) => {
    return axiosInstance.post('/v1/register', userData);
  },
};

export default UserService;

