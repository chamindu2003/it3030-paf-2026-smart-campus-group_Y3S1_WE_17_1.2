import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminPortalSidebar from '../components/AdminPortalSidebar';
import { adminSearchBookings, adminUpdateBookingStatus } from '../api/bookingService';
import { userAPI } from '../api/apiService';
import axiosInstance from '../api/axiosInstance';
import '../styles/adminDashboard.css';

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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const actingRole = 'ADMIN';

  const isAdmin = normalizeStatus(user?.role) === 'ADMIN';

  const [filterInputs, setFilterInputs] = useState({ userName: '', resourceName: '', status: '' });
  const [filters, setFilters] = useState({ userName: '', resourceName: '', status: '' });
  const [allBookings, setAllBookings] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [resourcesById, setResourcesById] = useState({});
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState(null);

  const [rejectModal, setRejectModal] = useState({ open: false, booking: null, reason: '' });

  const adminName = user?.name || 'Admin User';
  const adminEmail = user?.email || 'admin@example.com';
  const adminInitials = adminName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const getUserName = useCallback(
    (userId) => usersById[userId] || `User #${userId ?? 'N/A'}`,
    [usersById]
  );

  const getResourceName = useCallback(
    (resourceId) => resourcesById[resourceId] || `Resource #${resourceId ?? 'N/A'}`,
    [resourcesById]
  );

  const approvedBookings = useMemo(
    () => allBookings.filter((b) => normalizeStatus(b.status) === 'APPROVED'),
    [allBookings]
  );

  const bookings = useMemo(() => {
    const userFilter = filters.userName.trim().toLowerCase();
    const resourceFilter = filters.resourceName.trim().toLowerCase();
    const statusFilter = normalizeStatus(filters.status);

    return allBookings.filter((booking) => {
      const matchesStatus = !statusFilter || normalizeStatus(booking.status) === statusFilter;
      const matchesUser = !userFilter || getUserName(booking.userId).toLowerCase().includes(userFilter);
      const matchesResource = !resourceFilter || getResourceName(booking.resourceId).toLowerCase().includes(resourceFilter);
      return matchesStatus && matchesUser && matchesResource;
    });
  }, [allBookings, filters, getUserName, getResourceName]);

  const conflictIds = useMemo(() => {
    const ids = new Set();
    for (const b of allBookings) {
      const status = normalizeStatus(b.status);
      if (status !== 'PENDING') continue;
      if (approvedBookings.some((a) => overlaps(b, a))) ids.add(b.id);
    }
    return ids;
  }, [allBookings, approvedBookings]);

  const load = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const [bookingsData, usersData, facilitiesResponse] = await Promise.all([
        adminSearchBookings({
          status: undefined,
          actingRole,
        }),
        userAPI.getAll(),
        axiosInstance.get('/facilities'),
      ]);

      const userMap = {};
      (Array.isArray(usersData) ? usersData : []).forEach((u) => {
        if (u?.id == null) return;
        userMap[u.id] = u.name || u.email || `User #${u.id}`;
      });

      const resourceMap = {};
      const facilities = Array.isArray(facilitiesResponse?.data) ? facilitiesResponse.data : [];
      facilities.forEach((f) => {
        if (f?.id == null) return;
        resourceMap[f.id] = f.name || `Resource #${f.id}`;
      });

      setUsersById(userMap);
      setResourcesById(resourceMap);
      setAllBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const applyFilters = () => {
    setFilters({ ...filterInputs });
  };

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

  const handleLogout = () => {
    logout();
    navigate('/');
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
    <div className="admin-dashboard-page">
      <div className="admin-layout">
        <AdminPortalSidebar
          activeItem="bookings"
          bookingsCount={bookings.length}
          displayName={adminName}
          email={adminEmail}
          initials={adminInitials}
        />

        <main className="admin-main-content">
          <header className="admin-topbar">
            <div>
              <p className="admin-eyebrow">Smart Campus</p>
              <h1>Booking Management</h1>
              <p className="admin-subtitle">Review and update booking request statuses.</p>
            </div>

            <div className="admin-topbar-actions">
              <button className="admin-secondary-btn" type="button" onClick={() => navigate('/home')}>
                Overview
              </button>
              <button className="admin-secondary-btn" type="button" onClick={load} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button className="admin-danger-btn" type="button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          {error && <div className="admin-error-box">{error}</div>}

          <section className="dashboard-card booking-dashboard-card">
            <div className="admin-filters">
              <label>
                <span>User Name</span>
                <input
                  type="text" 
                  value={filterInputs.userName}
                  onChange={(e) => setFilterInputs((f) => ({ ...f, userName: e.target.value }))}
                  placeholder="Name"
                />
              </label>

              <label>
                <span>Resource Name</span>
                <input
                  type="text"
                  value={filterInputs.resourceName}
                  onChange={(e) => setFilterInputs((f) => ({ ...f, resourceName: e.target.value }))}
                  placeholder="e.g. Lecture Hall A"
                />
              </label>

              <label>
                <span>Status</span>
                <select
                  value={filterInputs.status}
                  onChange={(e) => setFilterInputs((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="">All</option>
                  <option value="PENDING">PENDING</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </label>

              <button className="refresh-btn" onClick={applyFilters} disabled={loading}>
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
                      <div>{getUserName(b.userId)}</div>
                      <div>{getResourceName(b.resourceId)}</div>
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
          </section>
        </main>
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

