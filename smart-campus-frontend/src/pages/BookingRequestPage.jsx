import { useLocation, useNavigate } from 'react-router-dom';
import BookingRequestForm from '../components/BookingRequestForm';
import UserPortalSidebar from '../components/UserPortalSidebar';
import { useAuth } from '../hooks/useAuth';
import '../styles/userdashboard.css';

function BookingRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const selectedResourceId = location.state?.resourceId ?? null;
  const selectedResourceName = location.state?.resourceName ?? null;

  const signedInEmail = user?.email || localStorage.getItem('userEmail') || 'user@example.com';
  const displayName = user?.name || signedInEmail.split('@')[0] || 'User';
  const userInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="userdash-page">
      <div className="userdash-layout">
        <UserPortalSidebar
          activeItem="bookings"
          displayName={displayName}
          email={signedInEmail}
          profilePicture={user?.profilePicture}
          userInitials={userInitials}
        />

        <main className="userdash-shell">
          <header className="userdash-header">
            <div>
              <p className="userdash-eyebrow">Smart Campus</p>
              <h1>Create Booking</h1>
              <p className="userdash-subtitle">Submit a new booking request</p>
            </div>

            <div className="userdash-actions">
              <button type="button" className="userdash-refresh-btn" onClick={() => navigate('/bookings')}>
                My Bookings
              </button>
              <button type="button" className="userdash-refresh-btn" onClick={() => navigate('/user/facilities')}>
                Facilities
              </button>
              <button type="button" className="userdash-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          <section className="userdash-panel" style={{ maxWidth: '980px' }}>
            <BookingRequestForm
              preselectedResourceId={selectedResourceId}
              preselectedResourceName={selectedResourceName}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

export default BookingRequestPage;

