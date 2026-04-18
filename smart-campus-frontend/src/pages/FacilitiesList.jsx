import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import AddFacilityModal from '../components/AddFacilityModal';
import EditFacilityModal from '../components/EditFacilityModal';
import '../styles/FacilitiesList.css';

const FACILITIES_API_URL = 'http://localhost:8081/api/facilities';

function FacilitiesList() {
  const [facilities, setFacilities] = useState([]);
  const [location, setLocation] = useState('');
  const [minCapacity, setMinCapacity] = useState('');
  const [type, setType] = useState('ALL');
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

  const fetchAllFacilities = async () => {
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
  };

  const fetchFilteredFacilities = async () => {
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
  };

  useEffect(() => {
    fetchAllFacilities();
    hasMountedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hasMountedRef.current) {
      return;
    }

    fetchFilteredFacilities();
  }, [type, minCapacity, location]);

  const getFacilityId = (facility) => facility.id ?? facility.facilityId ?? '-';
  const getFacilityName = (facility) => facility.name ?? facility.facilityName ?? '-';
  const getFacilityType = (facility) => facility.type ?? '-';
  const getFacilityCapacity = (facility) => facility.capacity ?? '-';
  const getFacilityLocation = (facility) => facility.location ?? '-';
  const getFacilityStatus = (facility) => facility.status ?? 'UNKNOWN';

  const getAvailabilityWindows = (facility) => {
    const value = facility.availabilityWindows ?? facility.availabilityWindow ?? facility.availability;

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return value || '-';
  };

  const getStartAndEndTime = (facility) => {
    const availability = getAvailabilityWindows(facility);

    if (!availability || availability === '-') {
      return { startTime: '-', endTime: '-' };
    }

    const parts = availability.split(' - ');

    if (parts.length === 2) {
      return {
        startTime: parts[0],
        endTime: parts[1]
      };
    }

    return {
      startTime: availability,
      endTime: '-'
    };
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

    const shouldDelete = window.confirm('Are you sure you want to delete this facility?');

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

  return (
    <div className="facilities-layout">
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
