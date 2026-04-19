import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import AddFacilityModal from '../components/AddFacilityModal';
import EditFacilityModal from '../components/EditFacilityModal';
import { bookingAPI, notificationAPI, userAPI } from '../api/apiService';
import { useAuth } from '../hooks/useAuth';
import '../styles/adminDashboard.css';
import '../styles/FacilitiesList.css';

const FACILITIES_API_URL = 'http://localhost:8081/api/facilities';

function FacilitiesList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const locationPath = useLocation();

  const [facilities, setFacilities] = useState([]);
  const [location, setLocation] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [type, setType] = useState('ALL');
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [sidebarMetrics, setSidebarMetrics] = useState({
    bookingsToday: 0,
    openTickets: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const hasMountedRef = useRef(false);

  const hasActiveFilters = () => type !== 'ALL' || minCapacity !== '' || location.trim() !== '';

  const refreshFacilities = () => {
    if (hasActiveFilters()) {
      fetchFilteredFacilities();
      return;
    }

    fetchAllFacilities();
  };

  const loadSidebarMetrics = useCallback(async () => {
    setSidebarLoading(true);

    try {
      const [bookingsData, notificationsData, usersData] = await Promise.all([
        bookingAPI.getAll(),
        notificationAPI.getAll(),
        userAPI.getAll(),
      ]);

      const today = new Date().toISOString().slice(0, 10);
      const bookingsToday = (Array.isArray(bookingsData) ? bookingsData : []).filter((booking) => booking?.bookingDate === today).length;
      const openTicketIds = new Set(
        (Array.isArray(notificationsData) ? notificationsData : [])
          .filter((notification) => ['TICKET_STATUS_CHANGED', 'NEW_COMMENT', 'TICKET_ASSIGNED'].includes(notification?.type))
          .map((notification) => notification?.referenceId)
          .filter((id) => id !== null && id !== undefined)
      );

      setSidebarMetrics({
        bookingsToday,
        openTickets: openTicketIds.size,
        totalUsers: Array.isArray(usersData) ? usersData.length : 0,
      });
    } catch {
      setSidebarMetrics({
        bookingsToday: 0,
        openTickets: 0,
        totalUsers: 0,
      });
    } finally {
      setSidebarLoading(false);
    }
  }, []);

  const fetchAllFacilities = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(FACILITIES_API_URL);
      setFacilities(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch facilities.');
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFilteredFacilities = useCallback(async () => {
    setLoading(true);
    setError('');

    const safeType = type === 'ALL' ? '' : type;
    const query = `?type=${encodeURIComponent(safeType)}&minCapacity=${encodeURIComponent(minCapacity)}&location=${encodeURIComponent(location)}`;

    try {
      const response = await axios.get(`${FACILITIES_API_URL}${query}`);
      setFacilities(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch facilities with filters.');
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  }, [type, minCapacity, location]);

  useEffect(() => {
    fetchAllFacilities();
    loadSidebarMetrics();
    hasMountedRef.current = true;
  }, [fetchAllFacilities, loadSidebarMetrics]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      return;
    }

    fetchFilteredFacilities();
  }, [fetchFilteredFacilities]);

  const getFacilityId = (facility) => facility.id ?? facility.facilityId ?? '-';
  const getFacilityName = (facility) => facility.name ?? facility.facilityName ?? '-';
  const getFacilityType = (facility) => facility.type ?? '-';
  const getFacilityCapacity = (facility) => facility.capacity ?? '-';
  const getFacilityLocation = (facility) => facility.location ?? '-';
  const getFacilityStatus = (facility) => {
    const rawStatus = facility?.status ?? facility?.facilityStatus ?? facility?.availabilityStatus;

    if (typeof rawStatus === 'string') {
      const normalized = rawStatus.trim().toUpperCase();
      return normalized || 'ACTIVE';
    }

    return rawStatus ?? 'ACTIVE';
  };

  const getAvailabilityWindows = (facility) => {
    const value = facility.availabilityWindows ?? facility.availabilityWindow ?? facility.availability;

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return value || '-';
  };

  const handleOpenEdit = (facility) => {
    setSelectedFacility(facility);
    setShowEditModal(true);
  };

  const handleDelete = async (facilityId) => {
    if (!facilityId) {
      setError('Facility id is missing.');
      return;
    }

    const shouldDelete = document.defaultView
      ? document.defaultView.confirm('Are you sure you want to delete this facility?')
      : false;

    if (!shouldDelete) {
      return;
    }

    setError('');

    try {
      await axios.delete(`${FACILITIES_API_URL}/${facilityId}`);
      refreshFacilities();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete facility.');
    }
  };

  const handleChangeStatus = async (facility) => {
    const facilityId = getFacilityId(facility);

    if (!facilityId || facilityId === '-') {
      setError('Facility id is missing.');
      return;
    }

    const currentStatus = getFacilityStatus(facility);
    const nextStatus = currentStatus === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';

    setError('');

    try {
      await axios.patch(`${FACILITIES_API_URL}/${facilityId}/status`, null, {
        params: { status: nextStatus }
      });
      refreshFacilities();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change facility status.');
    }
  };

  const goToOverview = () => {
    navigate('/home');
  };

  const goToUsers = () => {
    navigate('/home/users');
  };

  const goToFacilities = () => {
    navigate('/facilities');
  };

  const isOverviewPage = locationPath.pathname === '/home';
  const isUsersPage = locationPath.pathname === '/home/users';
  const isFacilitiesPage = locationPath.pathname === '/facilities';

  const adminInitials = useMemo(() => {
    const fullName = user?.name || 'Admin User';
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [user?.name]);

  return (
    <div className="facilities-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <h2 className="admin-portal-title">Admin Portal</h2>
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
              <li>
                <button type="button" className="admin-sidebar-item" onClick={goToOverview}>
                  <span className="admin-sidebar-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" strokeWidth="1.7" />
                      <path d="M8 3.5v3M16 3.5v3M8 11h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span>Bookings</span>
                  <span className="admin-sidebar-count">{sidebarLoading ? '...' : sidebarMetrics.bookingsToday}</span>
                </button>
              </li>
              <li>
                <button type="button" className="admin-sidebar-item" onClick={goToOverview}>
                  <span className="admin-sidebar-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="m5 18 4.8-4.8a3.3 3.3 0 0 1 4.6 0l.4.4a3.3 3.3 0 0 1 0 4.6L10 23" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                      <path d="m14 10 4.8-4.8a3.3 3.3 0 0 1 4.6 0l.4.4a3.3 3.3 0 0 1 0 4.6L19 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" transform="translate(-5 -5)" />
                    </svg>
                  </span>
                  <span>Tickets</span>
                  <span className="admin-sidebar-count">{sidebarLoading ? '...' : sidebarMetrics.openTickets}</span>
                </button>
              </li>
              <li>
                <button type="button" className={`admin-sidebar-item ${isFacilitiesPage ? 'is-active' : ''}`} onClick={goToFacilities}>
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
                  <span className="admin-sidebar-count">{sidebarLoading ? '...' : sidebarMetrics.totalUsers}</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="admin-sidebar-profile">
          <span className="admin-avatar">{adminInitials || 'AU'}</span>
          <div>
            <p className="admin-profile-name">{user?.name || 'Admin User'}</p>
            <p className="admin-profile-email">{user?.email || 'admin@example.com'}</p>
          </div>
        </div>
      </aside>

      <main className="facilities-main">
        <div className="facilities-topbar">
          <h2 className="page-title">Facility Management</h2>
          <button type="button" className="add-facility-btn" onClick={() => setShowAddModal(true)}>Add Facility</button>
        </div>

        <div className="filters-row">
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Filter by location"
            className="filter-input"
          />

          <input
            type="number"
            value={minCapacity}
            onChange={(event) => setMinCapacity(event.target.value)}
            placeholder="Minimum capacity"
            className="filter-input"
          />

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="filter-input"
          >
            <option value="ALL">ALL</option>
            <option value="LECTURE_HALL">LECTURE_HALL</option>
            <option value="LAB">LAB</option>
            <option value="MEETING_ROOM">MEETING_ROOM</option>
            <option value="EQUIPMENT">EQUIPMENT</option>
          </select>
        </div>

        {loading && <p className="status-text">Loading facilities...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <div className="table-card">
            <div className="table-wrap">
              <table className="facilities-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Location</th>
                    <th>Availability Windows</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="empty-cell">No facilities found.</td>
                    </tr>
                  ) : (
                    facilities.map((facility) => {
                      const status = getFacilityStatus(facility);
                      const isActive = status === 'ACTIVE';

                      return (
                        <tr key={getFacilityId(facility)}>
                          <td>{getFacilityId(facility)}</td>
                          <td>{getFacilityName(facility)}</td>
                          <td>{getFacilityType(facility)}</td>
                          <td>{getFacilityCapacity(facility)}</td>
                          <td>{getFacilityLocation(facility)}</td>
                          <td>{getAvailabilityWindows(facility)}</td>
                          <td>
                            <span className={`status-badge ${isActive ? 'status-active' : 'status-out'}`}>
                              {status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button type="button" className="action-btn btn-edit" onClick={() => handleOpenEdit(facility)}>Edit</button>
                              <button type="button" className="action-btn btn-delete" onClick={() => handleDelete(getFacilityId(facility))}>Delete</button>
                              <button type="button" className="action-btn btn-change-status" onClick={() => handleChangeStatus(facility)}>Change Status</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {showAddModal && (
        <AddFacilityModal
          onClose={() => setShowAddModal(false)}
          onSuccess={refreshFacilities}
        />
      )}

      {showEditModal && selectedFacility && (
        <EditFacilityModal
          facility={selectedFacility}
          onClose={() => {
            setShowEditModal(false);
            setSelectedFacility(null);
          }}
          onSuccess={refreshFacilities}
        />
      )}
    </div>
  );
}

export default FacilitiesList;
