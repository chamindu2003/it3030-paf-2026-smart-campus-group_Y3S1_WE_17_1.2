import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI, notificationAPI, userAPI } from '../api/apiService';
import NotificationPanel from '../components/NotificationPanel';
import UserPortalSidebar from '../components/UserPortalSidebar';
import { useAuth } from '../hooks/useAuth';
import '../styles/userdashboard.css';

function UserDashboard() {
  const { user, token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(user);
  const [bookings, setBookings] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const activeRole = String(profile?.role || user?.role || '').toUpperCase();
  const isAdmin = activeRole === 'ADMIN';

  const extractEmailFromToken = useCallback((jwtToken) => {
    if (!jwtToken || typeof jwtToken !== 'string') return null;
    try {
      const payload = jwtToken.split('.')[1];
      if (!payload) return null;
      const normalized = payload.replaceAll('-', '+').replaceAll('_', '/');
      const decoded = atob(normalized);
      const data = JSON.parse(decoded);
      return data?.sub || data?.email || null;
    } catch {
      return null;
    }
  }, []);

  const signedInEmail = useMemo(() => {
    return (
      user?.email ||
      localStorage.getItem('userEmail') ||
      extractEmailFromToken(token || localStorage.getItem('token')) ||
      null
    );
  }, [extractEmailFromToken, token, user?.email]);

  const loadDashboardData = useCallback(async () => {
    if (!signedInEmail) return;

    setLoading(true);
    setError(null);
    try {
      const profileData = await userAPI.getByEmail(signedInEmail);

      const [bookingsData, unreadData] = await Promise.all([
        bookingAPI.getAll(),
        notificationAPI.getUnreadCount(),
      ]);

      const allBookings = Array.isArray(bookingsData) ? bookingsData : [];
      const ownBookings = allBookings.filter(
        (item) => Number(item?.userId) === Number(profileData?.id)
      );

      setProfile(profileData);
      setBookings(ownBookings);
      setUnreadCount(unreadData?.unreadCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [signedInEmail]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(timer);
  }, [loadDashboardData]);

  useEffect(() => {
    if (isAdmin) {
      navigate('/home', { replace: true });
    }
  }, [isAdmin, navigate]);

  const metrics = useMemo(() => {
    const pending = bookings.filter((item) => String(item?.status || '').toUpperCase() === 'PENDING').length;
    const approved = bookings.filter((item) => String(item?.status || '').toUpperCase() === 'APPROVED').length;
    const rejected = bookings.filter((item) => String(item?.status || '').toUpperCase() === 'REJECTED').length;

    return {
      total: bookings.length,
      pending,
      approved,
      rejected,
    };
  }, [bookings]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const first = `${a?.bookingDate || ''}T${a?.startTime || '00:00'}`;
        const second = `${b?.bookingDate || ''}T${b?.startTime || '00:00'}`;
        return second.localeCompare(first);
      })
      .slice(0, 6);
  }, [bookings]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userInitials = useMemo(() => {
    const fullName = profile?.name || user?.name || signedInEmail || 'User Account';
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [profile?.name, signedInEmail, user?.name]);

  const displayName = useMemo(() => {
    if (profile?.name) return profile.name;
    if (user?.name) return user.name;
    if (signedInEmail) return signedInEmail.split('@')[0];
    return 'User';
  }, [profile?.name, signedInEmail, user?.name]);

  if (!isAuthenticated || !user) {
    return <div className="userdash-loader">Loading dashboard...</div>;
  }

  return (
    <div className="userdash-page">
      <div className="userdash-layout">
        <UserPortalSidebar
          activeItem="overview"
          bookingsCount={metrics.total}
          onTicketsClick={() => setNotificationOpen(true)}
          displayName={displayName}
          email={profile?.email || signedInEmail || user?.email || 'user@example.com'}
          profilePicture={profile?.profilePicture}
          userInitials={userInitials}
        />

        <main className="userdash-shell">
          <header className="userdash-header">
            <div>
              <p className="userdash-eyebrow">Smart Campus</p>
              <h1>User Dashboard</h1>
              <p className="userdash-subtitle">Welcome back, {displayName}.</p>
            </div>

            <div className="userdash-actions">
              <button
                type="button"
                className="userdash-notification-btn"
                onClick={() => setNotificationOpen(true)}
                aria-label="Open notifications"
              >
                <span className="userdash-bell" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 4.5a4 4 0 0 0-4 4v2.1c0 .9-.3 1.8-.9 2.5L6 14.5h12l-1.1-1.4a4 4 0 0 1-.9-2.5V8.5a4 4 0 0 0-4-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 17.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                {unreadCount > 0 && <span className="userdash-badge">{unreadCount}</span>}
              </button>
              <button type="button" className="userdash-refresh-btn" onClick={loadDashboardData} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button type="button" className="userdash-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          {error && <div className="userdash-error">{error}</div>}

          <section className="userdash-cards">
            <article className="userdash-card">
              <h3>Total Bookings</h3>
              <p>{metrics.total}</p>
            </article>
            <article className="userdash-card">
              <h3>Pending</h3>
              <p>{metrics.pending}</p>
            </article>
            <article className="userdash-card">
              <h3>Approved</h3>
              <p>{metrics.approved}</p>
            </article>
            <article className="userdash-card">
              <h3>Rejected</h3>
              <p>{metrics.rejected}</p>
            </article>
          </section>

          <section className="userdash-content-grid">
            <article className="userdash-panel">
              <div className="userdash-panel-head">
                <h2>My Recent Bookings</h2>
              </div>

              <div className="userdash-table-wrap">
                <table className="userdash-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Purpose</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="userdash-empty">No bookings found.</td>
                      </tr>
                    ) : (
                      recentBookings.map((item) => (
                        <tr key={item.id}>
                          <td>{item.bookingDate || '-'}</td>
                          <td>{item.startTime && item.endTime ? `${item.startTime} - ${item.endTime}` : '-'}</td>
                          <td>{item.purpose || '-'}</td>
                          <td>
                            <span className={`userdash-status status-${String(item.status || 'PENDING').toLowerCase()}`}>
                              {String(item.status || 'PENDING').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </article>

            <aside className="userdash-panel userdash-profile-panel">
              <h2>Profile</h2>
              <div className="userdash-profile-item">
                <span>Name</span>
                <strong>{profile?.name || '-'}</strong>
              </div>
              <div className="userdash-profile-item">
                <span>Email</span>
                <strong>{profile?.email || '-'}</strong>
              </div>
              <div className="userdash-profile-item">
                <span>Role</span>
                <strong>{activeRole || 'USER'}</strong>
              </div>
            </aside>
          </section>
        </main>
      </div>

      <NotificationPanel
        open={notificationOpen}
        onClose={() => {
          setNotificationOpen(false);
          loadDashboardData();
        }}
      />
    </div>
  );
}

export default UserDashboard;
