import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI, notificationAPI, userAPI } from '../api/apiService';
import NotificationPanel from '../components/NotificationPanel';
import { useAuth } from '../hooks/useAuth';
import '../styles/adminDashboard.css';

function AdminDashboard() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(user);
  const [profileLoading, setProfileLoading] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingEmail, setEditingEmail] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'USER' });
  const [userActionLoading, setUserActionLoading] = useState(false);

  // Role Checks
  const activeRole = (profile?.role || user?.role || '').toUpperCase();
  const isAdmin = activeRole === 'ADMIN';
  const isTechnician = activeRole === 'TECHNICIAN';
  const isStaff = isAdmin || isTechnician; // Both can access the dashboard layout

  const isUsersPage = location.pathname === '/home/users';
  const isOverviewPage = location.pathname === '/home';

  const loadProfile = useCallback(async () => {
    if (!user?.email) return;

    setProfileLoading(true);
    setError(null);
    try {
      const data = await userAPI.getByEmail(user.email);
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile data');
    } finally {
      setProfileLoading(false);
    }
  }, [user?.email]);

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await notificationAPI.getUnreadCount();
      setUnreadCount(data?.unreadCount || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const loadDashboardMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const [bookingsData, notificationsData, unreadData, usersData] = await Promise.all([
        bookingAPI.getAll(),
        notificationAPI.getAll(),
        notificationAPI.getUnreadCount(),
        userAPI.getAll(),
      ]);

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      setUnreadCount(unreadData?.unreadCount || 0);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      setError((prev) => prev || err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadUnreadCount();
  }, [loadProfile, loadUnreadCount]);

  useEffect(() => {
    // Only load full admin metrics if the user is actually an admin
    if (isAdmin) {
      loadDashboardMetrics();
    }
  }, [isAdmin, loadDashboardMetrics]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isAdmin) loadDashboardMetrics();
    }, 30000);

    return () => clearInterval(timer);
  }, [isAdmin, loadDashboardMetrics]);

  const metrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const bookingsToday = bookings.filter((b) => b?.bookingDate === today).length;
    const pendingApprovals = bookings.filter(
        (b) => String(b?.status || '').toUpperCase() === 'PENDING'
    ).length;

    const approvedDurations = bookings
        .filter((b) => String(b?.status || '').toUpperCase() === 'APPROVED')
        .map((b) => {
          if (!b?.startTime || !b?.endTime) return 0;
          const [startHour = 0, startMinute = 0] = String(b.startTime).split(':').map(Number);
          const [endHour = 0, endMinute = 0] = String(b.endTime).split(':').map(Number);
          const start = startHour * 60 + startMinute;
          const end = endHour * 60 + endMinute;
          return end > start ? (end - start) / 60 : 0;
        })
        .filter((h) => h > 0);

    const avgResolutionHours = approvedDurations.length
        ? (approvedDurations.reduce((sum, h) => sum + h, 0) / approvedDurations.length)
        : 0;

    const openTicketIds = new Set(
        notifications
            .filter((n) => ['TICKET_STATUS_CHANGED', 'NEW_COMMENT', 'TICKET_ASSIGNED'].includes(n?.type))
            .map((n) => n?.referenceId)
            .filter((id) => id !== null && id !== undefined)
    );

    return {
      bookingsToday,
      pendingApprovals,
      openTickets: openTicketIds.size,
      avgResolutionHours,
      totalUsers: users.length,
    };
  }, [bookings, notifications, users]);

  const userRoleCounts = useMemo(() => {
    return users.reduce(
        (acc, item) => {
          const role = String(item?.role || '').toUpperCase();
          acc.total += 1;
          if (role === 'ADMIN') acc.admins += 1;
          if (role === 'TECHNICIAN') acc.technicians += 1;
          if (role === 'USER') acc.users += 1;
          return acc;
        },
        { total: 0, admins: 0, technicians: 0, users: 0 }
    );
  }, [users]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefresh = async () => {
    await Promise.all([loadProfile(), loadUnreadCount(), isAdmin ? loadDashboardMetrics() : Promise.resolve()]);
  };

  const goToOverview = () => {
    navigate('/home');
  };

  const goToUsers = () => {
    navigate('/home/users');
  };

  const adminInitials = useMemo(() => {
    const fullName = profile?.name || user?.name || 'Staff User';
    return fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
  }, [profile?.name, user?.name]);

  const userInitials = useCallback((name, email) => {
    const seed = name || email || 'User';
    return seed
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
  }, []);

  const startEditUser = (userItem) => {
    setEditingEmail(userItem?.email || null);
    setEditForm({
      name: userItem?.name || '',
      email: userItem?.email || '',
      role: String(userItem?.role || 'USER').toUpperCase(),
    });
  };

  const cancelEditUser = () => {
    setEditingEmail(null);
    setEditForm({ name: '', email: '', role: 'USER' });
  };

  const saveUserChanges = async (userItem) => {
    const originalEmail = userItem?.email;
    if (!originalEmail) return;

    if (!editForm.name.trim() || !editForm.email.trim()) {
      setError('Name and email are required');
      return;
    }

    setUserActionLoading(true);
    setError(null);
    try {
      await userAPI.update(originalEmail, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: String(editForm.role || 'USER').toUpperCase(),
      });
      await loadDashboardMetrics();
      cancelEditUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setUserActionLoading(false);
    }
  };

  const deleteUser = async (userItem) => {
    const targetEmail = userItem?.email;
    if (!targetEmail) return;

    if (targetEmail === user?.email) {
      setError('You cannot delete your currently logged in account.');
      return;
    }

    setUserActionLoading(true);
    setError(null);
    try {
      await userAPI.delete(targetEmail);
      await loadDashboardMetrics();
      if (editingEmail === targetEmail) {
        cancelEditUser();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setUserActionLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return <div className="admin-dashboard-loader">Loading dashboard...</div>;
  }

  // Kicks out standard USERs, but lets ADMIN and TECHNICIAN in
  if (!isStaff) {
    return (
        <div className="admin-dashboard-page">
          <div className="admin-dashboard-shell">
            <section className="admin-access-card">
              <h1>Staff Dashboard</h1>
              <p>This area is only available for admin and staff accounts.</p>
              <button type="button" onClick={handleLogout} className="admin-danger-btn">
                Logout
              </button>
            </section>
          </div>
        </div>
    );
  }

  return (
      <div className="admin-dashboard-page">
        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-sidebar-top">
              <h2 className="admin-portal-title">{isAdmin ? 'Admin Portal' : 'Staff Portal'}</h2>
              <nav aria-label="Admin sidebar navigation">
                <ul className="admin-sidebar-list">
                  <li>
                    <button type="button" className={`admin-sidebar-item ${isOverviewPage ? 'is-active' : ''}`} onClick={goToOverview}>
                    <span className="admin-sidebar-icon" aria-hidden="true">
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

                  {/* NEW: My Tasks specifically for Technicians */}
                  {isTechnician && (
                      <li>
                        <button type="button" className="admin-sidebar-item" onClick={() => navigate('/my-tasks')}>
                        <span className="admin-sidebar-icon" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                          <span>My Tasks</span>
                        </button>
                      </li>
                  )}

                  <li>
                    <button type="button" className="admin-sidebar-item" onClick={() => navigate('/bookings')}>
                    <span className="admin-sidebar-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M8 3.5v3M16 3.5v3M8 11h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    </span>
                      <span>Bookings</span>
                      {isAdmin && <span className="admin-sidebar-count">{metricsLoading ? '...' : metrics.bookingsToday}</span>}
                    </button>
                  </li>
                  <li>
                    <button type="button" className="admin-sidebar-item" onClick={() => navigate('/tickets')}>
                    <span className="admin-sidebar-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="m5 18 4.8-4.8a3.3 3.3 0 0 1 4.6 0l.4.4a3.3 3.3 0 0 1 0 4.6L10 23" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        <path d="m14 10 4.8-4.8a3.3 3.3 0 0 1 4.6 0l.4.4a3.3 3.3 0 0 1 0 4.6L19 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" transform="translate(-5 -5)" />
                      </svg>
                    </span>
                      <span>Tickets</span>
                      {isAdmin && <span className="admin-sidebar-count">{metricsLoading ? '...' : metrics.openTickets}</span>}
                    </button>
                  </li>
                  <li>
                    <button type="button" className="admin-sidebar-item" onClick={() => navigate('/facilities')}>
                    <span className="admin-sidebar-icon" aria-hidden="true">
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

                  {/* Users Tab is ONLY for Admins */}
                  {isAdmin && (
                      <li>
                        <button type="button" className={`admin-sidebar-item ${isUsersPage ? 'is-active' : ''}`} onClick={goToUsers}>
                        <span className="admin-sidebar-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
                            <path d="M3.5 18a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                            <circle cx="17" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
                            <path d="M14.5 18a3.9 3.9 0 0 1 7.8 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        </svg>
                        </span>
                          <span>Users</span>
                          <span className="admin-sidebar-count">{metricsLoading ? '...' : metrics.totalUsers}</span>
                        </button>
                      </li>
                  )}
                </ul>
              </nav>
            </div>

            <div className="admin-sidebar-profile">
              <span className="admin-avatar">{adminInitials || 'ST'}</span>
              <div>
                <p className="admin-profile-name">{profile?.name || user?.name || 'Staff User'}</p>
                <p className="admin-profile-email">{profile?.email || user?.email || 'staff@example.com'}</p>
              </div>
            </div>
          </aside>

          <main className="admin-main-content">
            <header className="admin-topbar">
              <div>
                <p className="admin-eyebrow">Smart Campus</p>
                <h1>{isUsersPage ? 'User Management' : 'Dashboard Overview'}</h1>
                <p className="admin-subtitle">
                  {isUsersPage
                      ? 'Manage access and roles across the platform.'
                      : 'Welcome back. Here\'s what\'s happening today.'}
                </p>
              </div>

              <div className="admin-topbar-actions">
                <button
                    className="admin-notification-btn"
                    onClick={() => setNotificationOpen(true)}
                    type="button"
                    aria-label="Open notifications"
                >
                <span className="admin-notification-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 4.5a4 4 0 0 0-4 4v2.1c0 .9-.3 1.8-.9 2.5L6 14.5h12l-1.1-1.4a4 4 0 0 1-.9-2.5V8.5a4 4 0 0 0-4-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 17.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                  {unreadCount > 0 && <span className="admin-notification-badge">{unreadCount}</span>}
                </button>
                <button className="admin-secondary-btn" type="button" onClick={handleRefresh}>
                  {profileLoading || metricsLoading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button className="admin-danger-btn" type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            </header>

            {error && <div className="admin-error-box">{error}</div>}

            {isUsersPage && isAdmin ? (
                <section className="admin-users-panel">
                  <div className="admin-users-panel-header">
                    <div>
                      <h2>Users</h2>
                      <p>Manage access and roles across the platform.</p>
                    </div>
                  </div>

                  <div className="admin-users-table-wrap">
                    <table className="admin-users-table">
                      <thead>
                      <tr>
                        <th>Member</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                      </thead>
                      <tbody>
                      {users.map((member) => {
                        const isEditing = editingEmail === member.email;
                        return (
                            <tr key={member.id || member.email}>
                              <td>
                                <div className="admin-member-cell">
                                  <span className="admin-member-avatar">{userInitials(member.name, member.email)}</span>
                                  <div className="admin-member-text">
                                    {isEditing ? (
                                        <input
                                            className="admin-user-input"
                                            value={editForm.name}
                                            onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
                                            disabled={userActionLoading}
                                        />
                                    ) : (
                                        <strong>{member.name || 'Unnamed User'}</strong>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td>
                                {isEditing ? (
                                    <select
                                        className="admin-user-select"
                                        value={editForm.role}
                                        onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value }))}
                                        disabled={userActionLoading}
                                    >
                                      <option value="ADMIN">ADMIN</option>
                                      <option value="TECHNICIAN">TECHNICIAN</option>
                                      <option value="USER">USER</option>
                                    </select>
                                ) : (
                                    <span className={`admin-role-pill role-${String(member.role || 'USER').toLowerCase()}`}>
                              {String(member.role || 'USER').toUpperCase()}
                            </span>
                                )}
                              </td>

                              <td>
                                {isEditing ? (
                                    <input
                                        className="admin-user-input"
                                        value={editForm.email}
                                        onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                                        disabled={userActionLoading}
                                    />
                                ) : (
                                    <span className="admin-member-email">{member.email}</span>
                                )}
                              </td>

                              <td>
                                <span className="admin-status-dot">Active</span>
                              </td>

                              <td>
                                <div className="admin-users-actions">
                                  {isEditing ? (
                                      <>
                                        <button
                                            type="button"
                                            className="admin-inline-btn save"
                                            onClick={() => saveUserChanges(member)}
                                            disabled={userActionLoading}
                                        >
                                          Save
                                        </button>
                                        <button
                                            type="button"
                                            className="admin-inline-btn"
                                            onClick={cancelEditUser}
                                            disabled={userActionLoading}
                                        >
                                          Cancel
                                        </button>
                                      </>
                                  ) : (
                                      <>
                                        <button
                                            type="button"
                                            className="admin-inline-btn"
                                            onClick={() => startEditUser(member)}
                                            disabled={userActionLoading}
                                        >
                                          Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="admin-inline-btn delete"
                                            onClick={() => deleteUser(member)}
                                            disabled={userActionLoading}
                                        >
                                          Delete
                                        </button>
                                      </>
                                  )}
                                </div>
                              </td>
                            </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
                </section>
            ) : (
                <>
                  {/* Admin Metrics - Only shown to Admins */}
                  {isAdmin && (
                      <section className="admin-stats-grid">
                        <article className="admin-stat-card">
                          <div className="admin-card-top">
                        <span className="admin-card-icon is-blue" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
                            <path d="M8 3.5v3M16 3.5v3M8 11h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                        </span>
                          </div>
                          <h3>Bookings Today</h3>
                          <p>{metricsLoading ? '...' : metrics.bookingsToday}</p>
                        </article>

                        <article className="admin-stat-card">
                          <div className="admin-card-top">
                        <span className="admin-card-icon is-orange" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
                            <path d="M12 8v4l2.8 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                        </span>
                          </div>
                          <h3>Pending Approvals</h3>
                          <p>{metricsLoading ? '...' : metrics.pendingApprovals}</p>
                        </article>

                        <article className="admin-stat-card">
                          <div className="admin-card-top">
                        <span className="admin-card-icon is-red" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="m5 18 4.8-4.8a3.3 3.3 0 0 1 4.6 0l.4.4a3.3 3.3 0 0 1 0 4.6L10 23" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                            <path d="m14 10 4.8-4.8a3.3 3.3 0 0 1 4.6 0l.4.4a3.3 3.3 0 0 1 0 4.6L19 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" transform="translate(-5 -5)" />
                          </svg>
                        </span>
                          </div>
                          <h3>Open Tickets</h3>
                          <p>{metricsLoading ? '...' : metrics.openTickets}</p>
                        </article>

                        <article className="admin-stat-card">
                          <div className="admin-card-top">
                        <span className="admin-card-icon is-green" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
                            <path d="M12 8v4l-2.8 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                        </span>
                          </div>
                          <h3>Avg. Resolution</h3>
                          <p>{metricsLoading ? '...' : `${metrics.avgResolutionHours.toFixed(1)}h`}</p>
                        </article>
                      </section>
                  )}

                  {/* User Stats - Only shown to Admins */}
                  {isAdmin && (
                      <section className="admin-user-stats-panel">
                        <h2>User Statistics</h2>
                        <div className="admin-user-stats-row">
                          <article className="admin-user-stat">
                        <span className="admin-user-stat-icon is-violet" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
                            <path d="M3.5 18a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                        </span>
                            <div>
                              <p>Total Users</p>
                              <strong>{metricsLoading ? '...' : userRoleCounts.total}</strong>
                            </div>
                          </article>

                          <article className="admin-user-stat">
                        <span className="admin-user-stat-icon is-green" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h4l2-5 3 10 2-5h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                            <div>
                              <p>Admins</p>
                              <strong>{metricsLoading ? '...' : userRoleCounts.admins}</strong>
                            </div>
                          </article>

                          <article className="admin-user-stat">
                        <span className="admin-user-stat-icon is-indigo" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="8.5" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.7" />
                            <circle cx="15.5" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
                            <path d="M4 18a4.5 4.5 0 0 1 9 0M11 18a4.5 4.5 0 0 1 9 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                        </span>
                            <div>
                              <p>Technicians</p>
                              <strong>{metricsLoading ? '...' : userRoleCounts.technicians}</strong>
                            </div>
                          </article>

                          <article className="admin-user-stat">
                        <span className="admin-user-stat-icon is-amber" aria-hidden="true">
                          <svg viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
                            <path d="M4.5 19a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                          </svg>
                        </span>
                            <div>
                              <p>Standard Users</p>
                              <strong>{metricsLoading ? '...' : userRoleCounts.users}</strong>
                            </div>
                          </article>
                        </div>
                      </section>
                  )}

                  <section className="admin-quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="admin-quick-grid">

                      {/* My Tasks Quick Action specifically for Technicians */}
                      {isTechnician && (
                          <button type="button" className="admin-quick-card" onClick={() => navigate('/my-tasks')}>
                            <span className="admin-quick-icon" aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="none">
                                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                            <span>My Tasks</span>
                          </button>
                      )}

                      <button type="button" className="admin-quick-card" onClick={() => navigate('/bookings')}>
                    <span className="admin-quick-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M8 3.5v3M16 3.5v3M8 11h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    </span>
                        <span>Bookings</span>
                      </button>

                      <button type="button" className="admin-quick-card" onClick={() => navigate('/tickets')}>
                    <span className="admin-quick-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="m5 18 4.8-4.8a3.3 3.3 0 0 1 4.6 0l.4.4a3.3 3.3 0 0 1 0 4.6L10 23" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        <path d="m14 10 4.8-4.8a3.3 3.3 0 0 1 4.6 0l.4.4a3.3 3.3 0 0 1 0 4.6L19 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" transform="translate(-5 -5)" />
                      </svg>
                    </span>
                        <span>Tickets</span>
                      </button>

                      <button type="button" className="admin-quick-card" onClick={() => navigate('/facilities')}>
                    <span className="admin-quick-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M4 20V9m8 11V4m8 16v-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                        <rect x="2.5" y="9" width="3" height="11" rx="1" stroke="currentColor" strokeWidth="1.7" />
                        <rect x="10.5" y="4" width="3" height="16" rx="1" stroke="currentColor" strokeWidth="1.7" />
                        <rect x="18.5" y="13" width="3" height="7" rx="1" stroke="currentColor" strokeWidth="1.7" />
                      </svg>
                    </span>
                        <span>Facilities</span>
                      </button>

                      {/* Admin-Only Users Button */}
                      {isAdmin && (
                          <button type="button" className="admin-quick-card" onClick={goToUsers}>
                            <span className="admin-quick-icon" aria-hidden="true">
                              <svg viewBox="0 0 24 24" fill="none">
                                <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
                                <path d="M3.5 18a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                                <circle cx="17" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
                                <path d="M14.5 18a3.9 3.9 0 0 1 7.8 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                              </svg>
                            </span>
                            <span>Users</span>
                          </button>
                      )}
                    </div>
                  </section>
                </>
            )}
          </main>
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

export default AdminDashboard;