import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../api/apiService';

/**
 * HomePage Component
 * Protected page accessible only to authenticated users
 * Uses AuthContext via useAuth hook
 */
function HomePage() {
  const { user, token, logout, isAuthenticated } = useAuth();
  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadUserData = useCallback(async () => {
    if (!user?.email) return;

    setLoading(true);
    setError(null);

    try {
      const data = await userAPI.getByEmail(user.email);
      setUserData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>Welcome, {userData?.name || user.name}!</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="user-info">
          <h2>Your Profile</h2>
          <p><strong>Name:</strong> {userData?.name || user.name}</p>
          <p><strong>Email:</strong> {userData?.email || user.email}</p>
          <p><strong>Role:</strong> {userData?.role || user.role}</p>
        </div>

        <button
          className="refresh-btn"
          onClick={loadUserData}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>

        <div className="auth-info">
          <h3>Authentication Info</h3>
          <p><strong>Token:</strong> {token?.substring(0, 20)}...</p>
          <p><strong>Status:</strong> {isAuthenticated ? 'Logged In ✓' : 'Not Logged In'}</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

