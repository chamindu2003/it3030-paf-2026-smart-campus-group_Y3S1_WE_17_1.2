import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function AdminPortalSidebar({
  activeItem,
  bookingsCount = 0,
  ticketsCount = 0,
  usersCount = 0,
  displayName,
  email,
  initials,
}) {
  const navigate = useNavigate();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-top">
        <h2 className="admin-portal-title">Admin Portal</h2>
        <nav aria-label="Admin sidebar navigation">
          <ul className="admin-sidebar-list">
            <li>
              <button
                type="button"
                className={`admin-sidebar-item ${activeItem === 'overview' ? 'is-active' : ''}`}
                onClick={() => navigate('/home')}
              >
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
            <li>
              <button
                type="button"
                className={`admin-sidebar-item ${activeItem === 'bookings' ? 'is-active' : ''}`}
                onClick={() => navigate('/bookings')}
              >
                <span className="admin-sidebar-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M8 3.5v3M16 3.5v3M8 11h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </span>
                <span>Bookings</span>
                <span className="admin-sidebar-count">{bookingsCount}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`admin-sidebar-item ${activeItem === 'tickets' ? 'is-active' : ''}`}
                onClick={() => navigate('/tickets')}
              >
                <span className="admin-sidebar-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="m5 18 4.8-4.8a3.3 3.3 0 0 1 4.6 0l.4.4a3.3 3.3 0 0 1 0 4.6L10 23" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    <path d="m14 10 4.8-4.8a3.3 3.3 0 0 1 4.6 0l.4.4a3.3 3.3 0 0 1 0 4.6L19 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" transform="translate(-5 -5)" />
                  </svg>
                </span>
                <span>Tickets</span>
                <span className="admin-sidebar-count">{ticketsCount}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`admin-sidebar-item ${activeItem === 'facilities' ? 'is-active' : ''}`}
                onClick={() => navigate('/facilities')}
              >
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
            <li>
              <button
                type="button"
                className={`admin-sidebar-item ${activeItem === 'users' ? 'is-active' : ''}`}
                onClick={() => navigate('/home/users')}
              >
                <span className="admin-sidebar-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M3.5 18a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    <circle cx="17" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M14.5 18a3.9 3.9 0 0 1 7.8 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </span>
                <span>Users</span>
                <span className="admin-sidebar-count">{usersCount}</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div className="admin-sidebar-profile">
        <span className="admin-avatar">{initials || 'AU'}</span>
        <div>
          <p className="admin-profile-name">{displayName || 'Admin User'}</p>
          <p className="admin-profile-email">{email || 'admin@example.com'}</p>
        </div>
      </div>
    </aside>
  );
}

export default AdminPortalSidebar;

AdminPortalSidebar.propTypes = {
  activeItem: PropTypes.string,
  bookingsCount: PropTypes.number,
  ticketsCount: PropTypes.number,
  usersCount: PropTypes.number,
  displayName: PropTypes.string,
  email: PropTypes.string,
  initials: PropTypes.string,
};