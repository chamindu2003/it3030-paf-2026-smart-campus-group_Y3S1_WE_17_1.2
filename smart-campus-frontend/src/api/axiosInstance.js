import axios from 'axios';

/**
 * Create an Axios instance with:
 * - Base URL pointing to the backend API
 * - Automatic JWT token attachment from localStorage
 * - Proper headers configuration
 */
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to automatically attach JWT token
 * This runs before every request is sent
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle authentication errors
 * This runs after every response is received
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Return response if successful
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized (token expired or invalid)
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

