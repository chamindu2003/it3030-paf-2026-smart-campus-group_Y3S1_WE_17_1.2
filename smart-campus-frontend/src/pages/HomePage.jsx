import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import authService from '../api/authService';
import { userAPI } from '../api/apiService';

function HomePage({ user, onLogout }) {
  const [userData, setUserData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUserData = useCallback(async () => {
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
  }, [user.email]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>Welcome, {userData.name}!</h1>
          <button className="logout-btn" onClick={onLogout}>Logout</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="user-info">
          <h2>Your Profile</h2>
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Role:</strong> {userData.role}</p>
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
          <p><strong>Token:</strong> {authService.getToken()?.substring(0, 20)}...</p>
          <p><strong>Status:</strong> {authService.isLoggedIn() ? 'Logged In' : 'Not Logged In'}</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;

HomePage.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string.isRequired,
    name: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
  onLogout: PropTypes.func.isRequired,
};
