import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { adminSearchBookings, adminUpdateBookingStatus } from '../api/bookingService';

function normalizeStatus(status) {
  return String(status || '').trim().toUpperCase();
}

function overlaps(a, b) {
  if (!a || !b) return false;
  if (a.resourceId !== b.resourceId) return false;
  if (a.bookingDate !== b.bookingDate) return false;
  if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) return false;

  // times are "HH:mm:ss" strings in backend JSON
  return a.startTime < b.endTime && a.endTime > b.startTime;
}

function AdminBookingPage() {
  const { user } = useAuth();
  const actingRole = 'ADMIN';

  const isAdmin = normalizeStatus(user?.role) === 'ADMIN';

  const [filters, setFilters] = useState({ userId: '', resourceId: '', status: '' });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);

  const [rejectModal, setRejectModal] = useState({ open: false, booking: null, reason: '' });

  const approvedBookings = useMemo(
    () => bookings.filter((b) => normalizeStatus(b.status) === 'APPROVED'),
    [bookings]
  );

  const conflictIds = useMemo(() => {
    const ids = new Set();
    for (const b of bookings) {
      const status = normalizeStatus(b.status);
      if (status !== 'PENDING') continue;
      if (approvedBookings.some((a) => overlaps(b, a))) ids.add(b.id);
    }
    return ids;
  }, [bookings, approvedBookings]);

  const load = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminSearchBookings({
        userId: filters.userId ? Number(filters.userId) : undefined,
        resourceId: filters.resourceId ? Number(filters.resourceId) : undefined,
        status: filters.status ? filters.status : undefined,
        actingRole,
      });
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [filters, isAdmin]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const approve = async (booking) => {
    setActionId(booking.id);
    setError(null);
    try {
      await adminUpdateBookingStatus(booking.id, { status: 'APPROVED', actingRole });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to approve booking');
    } finally {
      setActionId(null);
    }
  };

  const openReject = (booking) => {
    setRejectModal({ open: true, booking, reason: '' });
  };

  const submitReject = async () => {
    if (!rejectModal.booking) return;
    if (!rejectModal.reason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    setActionId(rejectModal.booking.id);
    setError(null);
    try {
      await adminUpdateBookingStatus(rejectModal.booking.id, {
        status: 'REJECTED',
        rejectionReason: rejectModal.reason.trim(),
        actingRole,
      });
      setRejectModal({ open: false, booking: null, reason: '' });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to reject booking');
    } finally {
      setActionId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card">
          <h1>Admin Dashboard</h1>
          <div className="error-message">Forbidden: Admins only.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card booking-dashboard-card">
        <div className="dashboard-header">
          <h1>Admin Booking Dashboard</h1>
          <button className="toggle-btn" onClick={load} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="admin-filters">
          <label>
            <span>User ID</span>
            <input
              type="number"
              value={filters.userId}
              onChange={(e) => setFilters((f) => ({ ...f, userId: e.target.value }))}
              placeholder="e.g. 10"
            />
          </label>

          <label>
            <span>Resource ID</span>
            <input
              type="number"
              value={filters.resourceId}
              onChange={(e) => setFilters((f) => ({ ...f, resourceId: e.target.value }))}
              placeholder="e.g. 3"
            />
          </label>

          <label>
            <span>Status</span>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">All</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </label>

          <button className="refresh-btn" onClick={load} disabled={loading}>
            Apply filters
          </button>
        </div>

        <div className="booking-table">
          <div className="booking-table-head">
            <div>ID</div>
            <div>User</div>
            <div>Resource</div>
            <div>Date</div>
            <div>Time</div>
            <div>Status</div>
            <div>Action</div>
          </div>

          {bookings.length === 0 && !loading ? (
            <div className="booking-table-empty">No bookings found.</div>
          ) : (
            bookings.map((b) => {
              const status = normalizeStatus(b.status);
              const isPending = status === 'PENDING';
              const rowConflict = conflictIds.has(b.id);

              return (
                <div
                  className={`booking-table-row admin-row ${rowConflict ? 'booking-conflict' : ''}`}
                  key={b.id}
                >
                  <div>#{b.id}</div>
                  <div>#{b.userId}</div>
                  <div>#{b.resourceId}</div>
                  <div>{b.bookingDate || ''}</div>
                  <div>
                    {String(b.startTime || '').slice(0, 5)} - {String(b.endTime || '').slice(0, 5)}
                  </div>
                  <div>
                    <span className={`status-pill status-${status.toLowerCase()}`}>{status || '—'}</span>
                    {rowConflict && <span className="conflict-badge">CONFLICT?</span>}
                  </div>
                  <div className="admin-actions">
                    {isPending ? (
                      <>
                        <button
                          className="refresh-btn small-btn"
                          onClick={() => approve(b)}
                          disabled={actionId === b.id}
                        >
                          {actionId === b.id ? 'Working...' : 'Approve'}
                        </button>
                        <button
                          className="logout-btn cancel-btn small-btn"
                          onClick={() => openReject(b)}
                          disabled={actionId === b.id}
                        >
                          Reject
                        </button>
                      </>
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

      {rejectModal.open && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h2>Reject booking #{rejectModal.booking?.id}</h2>
            <p className="modal-subtitle">A reason is required.</p>

            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((m) => ({ ...m, reason: e.target.value }))}
              placeholder="Reason for rejection..."
              rows={4}
            />

            <div className="modal-actions">
              <button
                className="toggle-btn"
                onClick={() => setRejectModal({ open: false, booking: null, reason: '' })}
                disabled={actionId != null}
              >
                Close
              </button>
              <button className="logout-btn" onClick={submitReject} disabled={actionId != null}>
                {actionId != null ? 'Submitting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBookingPage;

