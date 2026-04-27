import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../api/apiService';
import UserPortalSidebar from '../components/UserPortalSidebar';
import { cancelBooking, getBookingsByUserId } from '../api/bookingService';
import '../styles/userdashboard.css';

function normalizeStatus(status) {
  return String(status || '').trim().toUpperCase();
}

function formatTime(t) {
  if (!t) return '';
  return String(t).slice(0, 5); // HH:mm from HH:mm:ss
}

function UserBookingsPage() {
  const navigate = useNavigate();
  const { user, token, logout, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState(user);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);

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

  const loadProfile = useCallback(async () => {
    if (!user?.email) return;
    try {
      const data = await userAPI.getByEmail(user.email);
      if (data) {
        setProfile(data);
      }
    } catch {
      // Fallback to current auth context profile if user-by-email fails.
    }
  }, [user?.email]);

  const loadBookings = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBookingsByUserId();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadProfile().catch(() => {});
  }, [loadProfile]);

  useEffect(() => {
    loadBookings().catch(() => {});
  }, [loadBookings]);

  const onCancel = async (bookingId) => {
    if (!isAuthenticated) return;
    setActionLoadingId(bookingId);
    setError(null);
    try {
      await cancelBooking(bookingId);
      await loadBookings();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to cancel booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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

  const metrics = useMemo(() => {
    const pending = bookings.filter((item) => normalizeStatus(item?.status) === 'PENDING').length;
    const approved = bookings.filter((item) => normalizeStatus(item?.status) === 'APPROVED').length;
    const rejected = bookings.filter((item) => normalizeStatus(item?.status) === 'REJECTED').length;

    return {
      total: bookings.length,
      pending,
      approved,
      rejected,
    };
  }, [bookings]);

  if (!isAuthenticated || !user) {
    return <div className="userdash-loader">Loading...</div>;
  }

  return (
    <div className="userdash-page">
      <div className="userdash-layout">
        <UserPortalSidebar
          activeItem="bookings"
          bookingsCount={metrics.total}
          displayName={displayName}
          email={profile?.email || signedInEmail || user?.email || 'user@example.com'}
          profilePicture={profile?.profilePicture}
          userInitials={userInitials}
        />

        <main className="userdash-shell">
          <header className="userdash-header">
            <div>
              <p className="userdash-eyebrow">Smart Campus</p>
              <h1>My Bookings</h1>
              <p className="userdash-subtitle">View and manage your bookings</p>
            </div>

            <div className="userdash-actions">
              <button
                type="button"
                className="userdash-refresh-btn"
                onClick={() => navigate('/bookings/new')}
              >
                New Booking
              </button>
              <button
                type="button"
                className="userdash-refresh-btn"
                onClick={loadBookings}
                disabled={loading || !isAuthenticated}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button type="button" className="userdash-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          {error && <div className="userdash-error">{error}</div>}

          <section className="userdash-content-grid">
            <article className="userdash-panel" style={{ gridColumn: '1 / -1' }}>
              <div className="userdash-panel-head">
                <h2>All Your Bookings</h2>
              </div>

              <div className="userdash-table-wrap">
                <table className="userdash-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Reason</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 && !loading ? (
                      <tr>
                        <td colSpan="5" className="userdash-empty">No bookings found.</td>
                      </tr>
                    ) : (
                      bookings.map((b) => {
                        const status = normalizeStatus(b.status);
                        const canCancel = status === 'PENDING' || status === 'APPROVED';

                        return (
                          <tr key={b.id}>
                            <td>{b.bookingDate || '-'}</td>
                            <td>
                              {formatTime(b.startTime)} - {formatTime(b.endTime)}
                            </td>
                            <td>
                              <span className={`userdash-status status-${status.toLowerCase()}`}>
                                {status || '—'}
                              </span>
                            </td>
                            <td>{status === 'REJECTED' ? b.rejectionReason || '—' : '—'}</td>
                            <td>
                              {canCancel ? (
                                <button
                                  className="userdash-logout-btn"
                                  style={{ fontSize: '0.875rem', padding: '0.4rem 0.8rem' }}
                                  onClick={() => onCancel(b.id)}
                                  disabled={actionLoadingId === b.id}
                                >
                                  {actionLoadingId === b.id ? 'Cancelling...' : 'Cancel'}
                                </button>
                              ) : (
                                <span style={{ color: '#999' }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}

export default UserBookingsPage;

