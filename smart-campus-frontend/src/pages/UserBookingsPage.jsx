import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../api/apiService';
import { cancelBooking, getBookingsByUserId } from '../api/bookingService';

function normalizeStatus(status) {
  return String(status || '').trim().toUpperCase();
}

function formatTime(t) {
  if (!t) return '';
  return String(t).slice(0, 5); // HH:mm from HH:mm:ss
}

function UserBookingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [userId, setUserId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const resolvedUserId = useMemo(() => userId, [userId]);

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

  return (
    <div className="dashboard-container">
      <div className="dashboard-card booking-dashboard-card">
        <div className="dashboard-header">
          <h1>Your Bookings</h1>
          <button className="logout-btn" onClick={() => navigate('/dashboard')}>
            Back
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="booking-actions-row">
          <button className="refresh-btn" onClick={() => navigate('/bookings/new')}>
            New booking
          </button>
          <button className="toggle-btn" onClick={loadBookings} disabled={loading || !resolvedUserId}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {!resolvedUserId && (
          <div className="auth-info">
            <p>
              <strong>Note:</strong> Couldn&apos;t determine your user id yet. Make sure your user object includes an
              `id` (or the backend user-by-email endpoint returns one).
            </p>
          </div>
        )}

        <div className="booking-table">
          <div className="booking-table-head">
            <div>Resource</div>
            <div>Date</div>
            <div>Time</div>
            <div>Status</div>
            <div>Reason</div>
            <div>Action</div>
          </div>

          {bookings.length === 0 && !loading ? (
            <div className="booking-table-empty">No bookings found.</div>
          ) : (
            bookings.map((b) => {
              const status = normalizeStatus(b.status);
              const canCancel = status === 'PENDING' || status === 'APPROVED';

              return (
                <div className="booking-table-row" key={b.id}>
                  <div>#{b.resourceId}</div>
                  <div>{b.bookingDate || ''}</div>
                  <div>
                    {formatTime(b.startTime)} - {formatTime(b.endTime)}
                  </div>
                  <div>
                    <span className={`status-pill status-${status.toLowerCase()}`}>{status || '—'}</span>
                  </div>
                  <div className="booking-reason">
                    {status === 'REJECTED' ? b.rejectionReason || '—' : '—'}
                  </div>
                  <div>
                    {canCancel ? (
                      <button
                        className="logout-btn cancel-btn"
                        onClick={() => onCancel(b.id)}
                        disabled={actionLoadingId === b.id}
                      >
                        {actionLoadingId === b.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    ) : (
                      <span className="booking-muted">—</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default UserBookingsPage;

