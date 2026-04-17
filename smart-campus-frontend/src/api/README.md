# React Axios API Integration

Complete axios setup with JWT authentication for connecting to the Spring Boot backend.

## 📁 Files Created

| File | Purpose |
|------|---------|
| `axiosInstance.js` | Axios instance with JWT token interceptor |
| `apiService.js` | API endpoint functions for Auth & Users |
| `authService.js` | Authentication service class |
| `USAGE_EXAMPLES.js` | Usage examples and documentation |

## 🚀 Quick Start

### Step 1: Install Axios

```bash
cd smart-campus-frontend
npm install axios
```

### Step 2: Use in Your React Component

```jsx
import authService from '../api/authService';
import { userAPI } from '../api/apiService';

function LoginPage() {
  const handleLogin = async (email, password) => {
    try {
      // Login and token is automatically stored
      const user = await authService.login(email, password);
      console.log('Logged in:', user);
      // Redirect to dashboard
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    // Your login form JSX
  );
}
```

### Step 3: Access Protected Endpoints

```jsx
import { userAPI } from '../api/apiService';
import { useEffect, useState } from 'react';

function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Token is automatically attached!
        const userData = await userAPI.getByEmail('user@example.com');
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };

    loadUser();
  }, []);

  return <div>{user && <h1>{user.name}</h1>}</div>;
}
```

## 📚 API Documentation

### Authentication Service

```javascript
import authService from '../api/authService';

// Login
await authService.login('email@example.com', 'password');

// Register
await authService.register('John', 'john@example.com', 'password', 'USER');

// Check if logged in
authService.isLoggedIn(); // true/false

// Get current user
authService.getCurrentUser(); // { name, email, role }

// Get token
authService.getToken(); // "eyJhbGci..."

// Logout
authService.logout();
```

### User API

```javascript
import { userAPI } from '../api/apiService';

// Get user by email (Protected)
await userAPI.getByEmail('user@example.com');

// Get public user info (Public)
await userAPI.getPublic();

// Update user (Protected)
await userAPI.update('user@example.com', { name: 'New Name' });

// Delete user (Protected)
await userAPI.delete('user@example.com');

// Get all users (Protected, Admin only)
await userAPI.getAll();
```

### Auth API (Low-level)

```javascript
import { authAPI } from '../api/apiService';

// Login
const response = await authAPI.login('email', 'password');
// Returns: { token: "...", role: "USER" }

// Register
const user = await authAPI.register('name', 'email', 'password', 'USER');

// Is authenticated
authAPI.isAuthenticated(); // true/false

// Get token
authAPI.getToken(); // "eyJhbGci..."

// Set auth data
authAPI.setAuthData(token, user);

// Clear auth
authAPI.logout();
```

## 🔑 How JWT Token Works

### Login Flow

```
1. User submits email + password
   ↓
2. POST /api/v1/login
   ↓
3. Backend returns { token: "...", role: "USER" }
   ↓
4. Token stored in localStorage
   ↓
5. Subsequent requests automatically include: Authorization: Bearer <token>
```

### Request Interceptor

```javascript
// Automatically runs before each request
if (token in localStorage) {
  request.headers.Authorization = `Bearer ${token}`;
}
```

### Response Interceptor

```javascript
// Automatically runs after each response
if (status === 401) {
  // Clear token
  // Redirect to /login
}
```

## 🛡️ Protected vs Public Endpoints

| Endpoint | Requires Token | Function |
|----------|---|---|
| `/v1/login` | ❌ No | `authAPI.login()` |
| `/v1/register` | ❌ No | `authAPI.register()` |
| `/v1/getUser` | ❌ No | `userAPI.getPublic()` |
| `/v1/user/:email` | ✅ Yes | `userAPI.getByEmail()` |
| `/v1/users` | ✅ Yes | `userAPI.getAll()` |

## 💾 LocalStorage Keys

| Key | Value | When Set |
|-----|-------|----------|
| `token` | JWT token string | After login |
| `user` | User object JSON | After login |
| `userEmail` | User email | After login |

## ⚠️ Error Handling

### Automatic 401 Handling

```javascript
try {
  const user = await userAPI.getByEmail('email@example.com');
} catch (error) {
  // If token is invalid or expired:
  // - Token is cleared from localStorage
  // - User is redirected to /login
  // - Error is thrown
}
```

### Manual Error Handling

```javascript
try {
  await authService.login('email', 'password');
} catch (error) {
  if (error.response?.status === 401) {
    console.log('Invalid credentials');
  } else if (error.response?.status === 404) {
    console.log('User not found');
  } else {
    console.log('Unknown error:', error.message);
  }
}
```

## 🔄 Real-World Example

```jsx
import { useState } from 'react';
import authService from '../api/authService';
import { userAPI } from '../api/apiService';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());
  const [user, setUser] = useState(authService.getCurrentUser());

  const handleLogin = async (email, password) => {
    try {
      const userData = await authService.login(email, password);
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  const loadUserData = async () => {
    try {
      const userData = await userAPI.getByEmail(user.email);
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  return (
    <div>
      {isLoggedIn ? (
        <div>
          <h1>Welcome, {user.name}</h1>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={loadUserData}>Refresh</button>
        </div>
      ) : (
        <div>
          <button onClick={() => handleLogin('test@example.com', 'password')}>
            Login
          </button>
        </div>
      )}
    </div>
  );
}
```

## 🧪 Testing in Browser Console

```javascript
// 1. Login
const loginResponse = await authService.login('admin@example.com', 'admin123');
console.log('Token:', authService.getToken());

// 2. Make protected request
const userData = await userAPI.getByEmail('admin@example.com');
console.log('User:', userData);

// 3. Check token in localStorage
console.log('Stored token:', localStorage.getItem('token'));

// 4. Logout
authService.logout();
console.log('Token after logout:', authService.getToken()); // null

// 5. Try protected request (will fail)
try {
  await userAPI.getByEmail('admin@example.com');
} catch (error) {
  console.log('Failed as expected - no token');
}
```

## 🎯 Key Features

✅ **Automatic JWT Attachment** - Token added to all requests  
✅ **LocalStorage Persistence** - Token survives page refresh  
✅ **Automatic 401 Handling** - Redirects to login on auth error  
✅ **Easy to Use API** - Simple functions for all endpoints  
✅ **Production Ready** - Error handling and edge cases covered  
✅ **Typescript Compatible** - Can be used with TypeScript projects  

## 📝 Notes

- Token is stored in **localStorage** (not secure for sensitive data in production)
- For production, consider:
  - Using httpOnly cookies instead
  - Implementing token refresh mechanism
  - Adding request timeout
  - Implementing retry logic

## 🔗 Backend Base URL

Currently set to: `http://localhost:8081/api`

To change, modify in `axiosInstance.js`:
```javascript
const axiosInstance = axios.create({
  baseURL: 'YOUR_NEW_BASE_URL',  // Change here
  headers: { 'Content-Type': 'application/json' },
});
```

---

**Ready to use!** 🚀

