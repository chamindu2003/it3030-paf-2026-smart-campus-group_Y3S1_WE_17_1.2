import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../api/apiService';
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
  const [userId, setUserId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const resolvedUserId = useMemo(() => userId, [userId]);

  const activeRole = String(profile?.role || user?.role || '').toUpperCase();

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

  const resolveUserId = useCallback(async () => {
    const candidate = user?.id ?? user?.userId ?? user?.user?.id ?? null;
    if (candidate != null) {
      setUserId(Number(candidate));
      return;
    }

    if (user?.email) {
      const data = await userAPI.getByEmail(user.email);
      const id = data?.id ?? data?.userId ?? null;
      if (id != null) {
        setUserId(Number(id));
        setProfile(data);
      }
    }
  }, [user]);

  const loadBookings = useCallback(async () => {
    if (!resolvedUserId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getBookingsByUserId(resolvedUserId);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [resolvedUserId]);

  useEffect(() => {
    resolveUserId().catch(() => {});
  }, [resolveUserId]);

  useEffect(() => {
    loadBookings().catch(() => {});
  }, [loadBookings]);

  const onCancel = async (bookingId) => {
    if (!resolvedUserId) return;
    setActionLoadingId(bookingId);
    setError(null);
    try {
      await cancelBooking(bookingId, resolvedUserId);
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
        <aside className="userdash-sidebar">
          <div className="userdash-sidebar-top">
            <h2 className="userdash-sidebar-title">User Portal</h2>
            <nav aria-label="User sidebar navigation">
              <ul className="userdash-sidebar-list">
                <li>
                  <button
                    type="button"
                    className="userdash-sidebar-item"
                    onClick={() => navigate('/home')}
                  >
                    <span className="userdash-sidebar-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
                        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
                        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
                        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    </span>
                    <span>Overview</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="userdash-sidebar-item is-active"
                  >
                    <span className="userdash-sidebar-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M8 3.5v3M16 3.5v3M8 11h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span>My Bookings</span>
                    <span className="userdash-sidebar-count">{metrics.total}</span>
                  </button>
                </li>
                <li>
                  <button type="button" className="userdash-sidebar-item">
                    <span className="userdash-sidebar-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="m5 18 4.8-4.8a3.3 3.3 0 0 1 4.6 0l.4.4a3.3 3.3 0 0 1 0 4.6L10 23" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        <path d="m14 10 4.8-4.8a3.3 3.3 0 0 1 4.6 0l.4.4a3.3 3.3 0 0 1 0 4.6L19 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" transform="translate(-5 -5)" />
                      </svg>
                    </span>
                    <span>Tickets</span>
                  </button>
                </li>
                <li>
                  <button type="button" className="userdash-sidebar-item">
                    <span className="userdash-sidebar-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M4 20V9m8 11V4m8 16v-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        <rect x="2.5" y="9" width="3" height="11" rx="1" stroke="currentColor" strokeWidth="1.7" />
                        <rect x="10.5" y="4" width="3" height="16" rx="1" stroke="currentColor" strokeWidth="1.7" />
                        <rect x="18.5" y="13" width="3" height="7" rx="1" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    </span>
                    <span>Facilities</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div className="userdash-sidebar-profile">
            <span className="userdash-avatar">
              {profile?.profilePicture ? (
                <img src={profile.profilePicture} alt={displayName} className="userdash-avatar-image" />
              ) : (
                userInitials || 'UA'
              )}
            </span>
            <div>
              <p className="userdash-profile-name">{displayName}</p>
              <p className="userdash-profile-email">{profile?.email || signedInEmail || user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </aside>

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
                disabled={loading || !resolvedUserId}
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button type="button" className="userdash-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          {error && <div className="userdash-error">{error}</div>}

          {!resolvedUserId && (
            <div className="userdash-error">
              <strong>Note:</strong> Couldn&apos;t determine your user id yet. Make sure your user object includes an
              `id` (or the backend user-by-email endpoint returns one).
            </div>
          )}

          <section className="userdash-content-grid">
            <article className="userdash-panel" style={{ gridColumn: '1 / -1' }}>
              <div className="userdash-panel-head">
                <h2>All Your Bookings</h2>
              </div>

              <div className="userdash-table-wrap">
                <table className="userdash-table">
                  <thead>
                    <tr>
                      <th>Resource</th>
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
                        <td colSpan="6" className="userdash-empty">No bookings found.</td>
                      </tr>
                    ) : (
                      bookings.map((b) => {
                        const status = normalizeStatus(b.status);
                        const canCancel = status === 'PENDING' || status === 'APPROVED';

                        return (
                          <tr key={b.id}>
                            <td>#{b.resourceId}</td>
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

