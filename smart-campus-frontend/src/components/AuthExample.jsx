import { useState } from 'react';
import authService from '../api/authService';
import { userAPI } from '../api/apiService';

/**
 * LoginComponent - Example login component
 * Shows how to use authService for authentication
 */
function LoginComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const user = await authService.login(email, password);
      setSuccess(`Welcome, ${user.name}!`);
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>Login</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '10px' }}>{success}</div>}

      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

/**
 * UserProfileComponent - Example component to display user data
 * Shows how to use userAPI to fetch protected data
 */
function UserProfileComponent() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUserData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error('Not logged in');
      }
      const data = await userAPI.getByEmail(user.email);
      setUserData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  if (!user) {
    return <div>Not logged in. Please <a href="/login">login</a>.</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
      <h2>User Profile</h2>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div style={{ marginBottom: '20px' }}>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      {userData && (
        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <h3>Detailed User Data</h3>
          <pre>{JSON.stringify(userData, null, 2)}</pre>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={loadUserData}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : 'Load Full Data'}
        </button>

        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

/**
 * App - Main component showing authentication flow
 */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());
  const [activeTab, setActiveTab] = useState('login');

  if (isLoggedIn) {
    return (
      <div>
        <h1>Welcome to OperationHub</h1>
        <UserProfileComponent />
      </div>
    );
  }

  return (
    <div>
      <h1>OperationHub - Authentication Demo</h1>
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => setActiveTab('login')}
          style={{
            marginRight: '10px',
            padding: '10px 20px',
            backgroundColor: activeTab === 'login' ? '#007bff' : '#ccc',
            color: activeTab === 'login' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Login
        </button>
      </div>

      {activeTab === 'login' && <LoginComponent />}
    </div>
  );
}

export default App;
export { LoginComponent, UserProfileComponent };

