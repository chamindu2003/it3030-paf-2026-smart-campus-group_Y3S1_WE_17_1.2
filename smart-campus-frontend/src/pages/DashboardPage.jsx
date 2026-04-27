import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { notificationAPI, userAPI } from '../api/apiService';
import NotificationPanel from '../components/NotificationPanel';

/**
 * DashboardPage Component
 * Protected page accessible only to authenticated users
 * Uses AuthContext via useAuth hook
 */
function DashboardPage() {
  const { user, token, logout, isAuthenticated } = useAuth();
  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
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

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await notificationAPI.getUnreadCount();
      setUnreadCount(data?.unreadCount || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(timer);
  }, [loadUnreadCount]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>Welcome, {userData?.name || user.name}!</h1>
          <div className="dashboard-header-actions">
            <button
              className="notification-bell"
              onClick={() => setNotificationOpen(true)}
              type="button"
            >
              Notifications
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
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

      <NotificationPanel
        open={notificationOpen}
        onClose={() => {
          setNotificationOpen(false);
          loadUnreadCount();
        }}
      />
    </div>
  );
}

export default DashboardPage;
