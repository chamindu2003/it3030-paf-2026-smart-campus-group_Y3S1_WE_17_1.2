import axiosInstance from './axiosInstance';

/**
 * Authentication API Endpoints
 */
export const authAPI = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Token and user data
   */
  login: async (email, password) => {
    const response = await axiosInstance.post('/v1/login', { email, password });
    return response.data;
  },

  /**
   * Register new user
   * @param {string} name - User name
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role
   * @returns {Promise<Object>} - New user data
   */
  register: async (name, email, password, role = 'USER') => {
    const response = await axiosInstance.post('/v1/register', { name, email, password, role });
    return response.data;
  },

  /**
   * Logout user (clears token from localStorage)
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userEmail');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if token exists in localStorage
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get stored token
   * @returns {string|null} - JWT token or null
   */
  getToken: () => {
    return localStorage.getItem('token');
  },

  /**
   * Get stored user data
   * @returns {Object|null} - User object or null
   */
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Store token and user data
   * @param {string} token - JWT token
   * @param {Object} user - User data
   */
  setAuthData: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};

/**
 * User API Endpoints
 */
export const userAPI = {
  /**
   * Get user by email (Protected)
   * @param {string} email - User email
   * @returns {Promise<Object>} - User data
   */
  getByEmail: async (email) => {
    const response = await axiosInstance.get(`/v1/user/${email}`);
    return response.data;
  },

  /**
   * Get public user info (Public)
   * @returns {Promise<Object>} - Public user data
   */
  getPublic: async () => {
    const response = await axiosInstance.get('/v1/getUser');
    return response.data;
  },

  /**
   * Update user (Protected)
   * @param {string} email - User email
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} - Updated user
   */
  update: async (email, userData) => {
    const response = await axiosInstance.put(`/v1/user/${email}`, userData);
    return response.data;
  },

  /**
   * Delete user (Protected)
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  delete: async (email) => {
    await axiosInstance.delete(`/v1/user/${email}`);
  },

  /**
   * Get all users (Protected, Admin only)
   * @returns {Promise<Array>} - List of all users
   */
  getAll: async () => {
    const response = await axiosInstance.get('/v1/users');
    return response.data;
  },
};

/**
 * Booking API Endpoints
 */
export const bookingAPI = {
  /**
   * Get all bookings (Protected)
   * @returns {Promise<Array>} - List of bookings
   */
  getAll: async () => {
    const response = await axiosInstance.get('/v1/bookings');
    return response.data;
  },
};

/**
 * Notification API Endpoints
 */
export const notificationAPI = {
  /**
   * Get all notifications for current authenticated user
   * @returns {Promise<Array>} - List of notifications
   */
  getAll: async () => {
    const response = await axiosInstance.get('/v1/notifications');
    return response.data;
  },

  /**
   * Get unread notification count
   * @returns {Promise<Object>} - { unreadCount: number }
   */
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/v1/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark one notification as read
   * @param {string} id - Notification UUID
   * @returns {Promise<Object>} - Updated notification
   */
  markAsRead: async (id) => {
    const response = await axiosInstance.patch(`/v1/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} - { markedRead: number }
   */
  markAllAsRead: async () => {
    const response = await axiosInstance.patch('/v1/notifications/read-all');
    return response.data;
  },

  /**
   * Delete one notification
   * @param {string} id - Notification UUID
   * @returns {Promise<void>}
   */
  deleteOne: async (id) => {
    await axiosInstance.delete(`/v1/notifications/${id}`);
  },
};

const apiService = {
  auth: authAPI,
  user: userAPI,
  booking: bookingAPI,
  notification: notificationAPI,
};

export default apiService;

