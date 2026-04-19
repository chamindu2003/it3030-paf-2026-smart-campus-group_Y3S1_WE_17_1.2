import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotificationPanel from '../components/NotificationPanel';
import { notificationAPI, userAPI } from '../api/apiService';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import '../styles/userdashboard.css';
import '../styles/FacilitiesPage.css';

const FILTER_TYPES = ['All', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'];

const FacilitiesPage = () => {
  const { user, token, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(user);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const loadUnreadCount = useCallback(async () => {
    try {
      const data = await notificationAPI.getUnreadCount();
      setUnreadCount(data?.unreadCount || 0);
    } catch {
      setUnreadCount(0);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    if (!signedInEmail) return;
    try {
      const profileData = await userAPI.getByEmail(signedInEmail);
      setProfile(profileData);
    } catch {
      // keep fallback profile from auth context
    }
  }, [signedInEmail]);

  useEffect(() => {
    if (isAdmin) {
      navigate('/home', { replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    loadProfile();
    loadUnreadCount();
  }, [loadProfile, loadUnreadCount]);

  useEffect(() => {
    const timer = setInterval(() => {
      loadUnreadCount();
    }, 30000);

    return () => clearInterval(timer);
  }, [loadUnreadCount]);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await axiosInstance.get('/facilities');
        setFacilities(Array.isArray(response.data) ? response.data : []);
      } catch {
        setError('Failed to load facilities. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      const matchesType = selectedType === 'All' || facility?.type === selectedType;

      const name = (facility?.name || '').toLowerCase();
      const location = (facility?.location || '').toLowerCase();
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch = !search || name.includes(search) || location.includes(search);

      const isAvailable = facility?.status === 'ACTIVE';
      const matchesAvailability = !availableOnly || isAvailable;

      return matchesType && matchesSearch && matchesAvailability;
    });
  }, [facilities, selectedType, searchTerm, availableOnly]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/facilities');
      setFacilities(Array.isArray(response.data) ? response.data : []);
      await loadUnreadCount();
    } catch {
      setError('Failed to load facilities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (facility) => {
    if (facility?.status === 'ACTIVE') {
      alert('Booking feature coming soon!');
    }
  };

  const renderFacilitiesContent = () => {
    if (loading) {
      return <p className="facilities-state-message">Loading facilities...</p>;
    }

    if (error) {
      return <p className="facilities-state-message error">{error}</p>;
    }

    if (filteredFacilities.length === 0) {
      return <p className="facilities-state-message">No facilities found.</p>;
    }

    return (
      <section className="facilities-grid">
        {filteredFacilities.map((facility) => {
          const isActive = facility?.status === 'ACTIVE';
          const isInactive = !isActive;

          return (
            <article key={facility?.id || `${facility?.name}-${facility?.location}`} className="facility-card">
              <div className="facility-image-placeholder">
                <span className={`status-badge ${isActive ? 'available' : 'unavailable'}`}>
                  {isActive ? 'Available' : 'Unavailable'}
                </span>
                <span className="type-badge">{facility?.type || 'UNKNOWN'}</span>
                <span className="placeholder-type-text">{facility?.type || 'FACILITY'}</span>
              </div>

              <div className="facility-card-content">
                <h3>{facility?.name || 'Unnamed Facility'}</h3>

                <p className="meta-row">
                  <span className="meta-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 22C12 22 19 16 19 10A7 7 0 1 0 5 10C5 16 12 22 12 22Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </span>
                  <span>{facility?.location || 'Location not specified'}</span>
                </p>

                <p className="meta-row">
                  <span className="meta-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                      <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
                      <path
                        d="M3 20C3 16.7 5.7 14 9 14C12.3 14 15 16.7 15 20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M14 20C14.2 17.8 16 16 18.2 16C20.4 16 22.2 17.8 22.4 20"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <span>Capacity: {facility?.capacity ?? 'N/A'}</span>
                </p>

                <button
                  type="button"
                  className={`book-btn ${isInactive ? 'disabled' : ''}`}
                  disabled={isInactive}
                  onClick={() => handleBookNow(facility)}
                >
                  {isActive ? 'Book Now' : 'Unavailable'}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    );
  };

  if (!isAuthenticated || !user) {
    return <div className="userdash-loader">Loading facilities...</div>;
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
                  <button type="button" className="userdash-sidebar-item" onClick={() => navigate('/dashboard')}>
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
                  <button type="button" className="userdash-sidebar-item" onClick={() => navigate('/bookings')}>
                    <span className="userdash-sidebar-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
                        <path d="M8 3.5v3M16 3.5v3M8 11h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span>My Bookings</span>
                  </button>
                </li>
                <li>
                  <button type="button" className="userdash-sidebar-item" onClick={() => setNotificationOpen(true)}>
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
                  <button type="button" className="userdash-sidebar-item is-active" onClick={() => navigate('/user/facilities')}>
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
              <h1>Facilities</h1>
              <p className="userdash-subtitle">Browse and book campus facilities</p>
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
              <button type="button" className="userdash-refresh-btn" onClick={handleRefresh} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
              <button type="button" className="userdash-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>

          <div className="facilities-page">
            <section className="facilities-header">
              <div>
                <h1>Facilities</h1>
                <p>Browse and book campus facilities</p>
              </div>

              <input
                type="text"
                className="facilities-search"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </section>

            <section className="facilities-filter-row">
              <div className="filter-buttons">
                {FILTER_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`filter-btn ${selectedType === type ? 'active' : ''}`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <label className="available-toggle" htmlFor="availableOnly">
                <span>Available Only</span>
                <span className="toggle-switch">
                  <input
                    id="availableOnly"
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(event) => setAvailableOnly(event.target.checked)}
                  />
                  <span className="toggle-slider" />
                </span>
              </label>
            </section>

            {renderFacilitiesContent()}
          </div>
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
};

export default FacilitiesPage;
