// ============================================================================
// AXIOS INSTANCE USAGE EXAMPLES
// ============================================================================

// ============================================================================
// 1. IMPORT IN YOUR REACT COMPONENTS
// ============================================================================

import axiosInstance from '../api/axiosInstance';

// ============================================================================
// 2. LOGIN - Get and Store Token
// ============================================================================

async function handleLogin(email, password) {
  try {
    const response = await axiosInstance.post('/v1/login', {
      email,
      password,
    });

    // Store token in localStorage
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));

    console.log('Login successful!');
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

// ============================================================================
// 3. GET USER (Protected - Token Automatically Attached)
// ============================================================================

async function getUser(email) {
  try {
    // Token is automatically added to Authorization header
    const response = await axiosInstance.get(`/v1/user/${email}`);
    console.log('User data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error.response?.data || error.message);
  }
}

// ============================================================================
// 4. PUBLIC ENDPOINT (No Token Needed)
// ============================================================================

async function getPublicUser() {
  try {
    // This endpoint doesn't require a token
    const response = await axiosInstance.get('/v1/getUser');
    console.log('Public user data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch public user:', error.response?.data || error.message);
  }
}

// ============================================================================
// 5. REGISTER USER
// ============================================================================

async function handleRegister(name, email, password, role) {
  try {
    const response = await axiosInstance.post('/v1/register', {
      name,
      email,
      password,
      role,
    });

    console.log('Registration successful!');
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
  }
}

// ============================================================================
// 6. LOGOUT - Clear Token
// ============================================================================

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Logged out successfully');
  window.location.href = '/login';
}

// ============================================================================
// 7. IN A REACT COMPONENT
// ============================================================================

import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userEmail = localStorage.getItem('userEmail');
        const response = await axiosInstance.get(`/v1/user/${userEmail}`);
        setUser(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!user) return <p>No user data</p>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}

// ============================================================================
// 8. WHAT HAPPENS AUTOMATICALLY
// ============================================================================

/*
REQUEST INTERCEPTOR (Automatic):
├─ Gets token from localStorage
├─ Adds to Authorization header: "Bearer <token>"
├─ Sends request with token
└─ Returns config to axios

RESPONSE INTERCEPTOR (Automatic):
├─ If status 200-299: Return response
├─ If status 401 (Unauthorized):
│  ├─ Clear token from localStorage
│  ├─ Redirect to /login
│  └─ Reject promise
└─ Other errors: Reject promise
*/

// ============================================================================
// 9. TOKEN LIFECYCLE
// ============================================================================

/*
WORKFLOW:
1. User logs in → POST /v1/login
2. Backend returns token → Stored in localStorage
3. User makes request → Token auto-added to Authorization header
4. Backend validates token → Processes request
5. User logs out → Token removed from localStorage
6. Subsequent requests → No token, endpoints return 401 if protected
7. Interceptor catches 401 → Clears storage and redirects to login
*/

// ============================================================================
// 10. TESTING IN BROWSER CONSOLE
// ============================================================================

/*
// 1. Login
await axiosInstance.post('/v1/login', {
  email: 'admin@example.com',
  password: 'admin123'
});

// 2. Check token in localStorage
localStorage.getItem('token');

// 3. Make request (token auto-added)
await axiosInstance.get('/v1/user/admin@example.com');

// 4. Logout
localStorage.removeItem('token');

// 5. Try request without token (will fail)
await axiosInstance.get('/v1/user/admin@example.com');
*/

export { handleLogin, getUser, getPublicUser, handleRegister, handleLogout };

