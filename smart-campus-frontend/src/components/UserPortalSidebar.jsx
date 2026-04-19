import { useNavigate } from 'react-router-dom';

function UserPortalSidebar({
  activeItem,
  bookingsCount = 0,
  onTicketsClick,
  displayName,
  email,
  profilePicture,
  userInitials,
}) {
  const navigate = useNavigate();

  return (
    <aside className="userdash-sidebar">
      <div className="userdash-sidebar-top">
        <h2 className="userdash-sidebar-title">User Portal</h2>
        <nav aria-label="User sidebar navigation">
          <ul className="userdash-sidebar-list">
            <li>
              <button
                type="button"
                className={`userdash-sidebar-item ${activeItem === 'overview' ? 'is-active' : ''}`}
                onClick={() => navigate('/dashboard')}
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
                className={`userdash-sidebar-item ${activeItem === 'bookings' ? 'is-active' : ''}`}
                onClick={() => navigate('/bookings')}
              >
                <span className="userdash-sidebar-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
                    <path d="M8 3.5v3M16 3.5v3M8 11h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  </svg>
                </span>
                <span>My Bookings</span>
                <span className="userdash-sidebar-count">{bookingsCount}</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`userdash-sidebar-item ${activeItem === 'tickets' ? 'is-active' : ''}`}
                onClick={onTicketsClick}
              >
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
              <button
                type="button"
                className={`userdash-sidebar-item ${activeItem === 'facilities' ? 'is-active' : ''}`}
                onClick={() => navigate('/user/facilities')}
              >
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
          {profilePicture ? (
            <img src={profilePicture} alt={displayName} className="userdash-avatar-image" />
          ) : (
            userInitials || 'UA'
          )}
        </span>
        <div>
          <p className="userdash-profile-name">{displayName}</p>
          <p className="userdash-profile-email">{email || 'user@example.com'}</p>
        </div>
      </div>
    </aside>
  );
}

export default UserPortalSidebar;