import { Fragment, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import EditFacilityModal from '../components/EditFacilityModal';
import '../styles/FacilityDetail.css';

const FACILITIES_API_URL = 'http://localhost:8081/api/facilities';

function FacilityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchFacility = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${FACILITIES_API_URL}/${id}`);
      setFacility(response.data || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch facility details.');
      setFacility(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacility();
  }, [id]);

  const handleBack = () => {
    navigate('/facilities');
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm('Are you sure you want to delete this facility?');

    if (!shouldDelete) {
      return;
    }

    setError('');

    try {
      await axios.delete(`${FACILITIES_API_URL}/${id}`);
      navigate('/facilities');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete facility.');
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleString();
  };

  const getStatus = (value) => value ?? 'UNKNOWN';

  const getAvailabilityWindows = (value) => {
    if (!value) {
      return '-';
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return value;
  };

  const getStartAndEndTime = (value) => {
    const availability = getAvailabilityWindows(value);

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

  const status = getStatus(facility?.status);
  const isActive = status === 'ACTIVE';
  const { startTime, endTime } = getStartAndEndTime(
    facility?.availabilityWindows ?? facility?.availabilityWindow ?? facility?.availability
  );

  const details = [
    { label: 'ID', value: facility?.id ?? facility?.facilityId ?? '-' },
    { label: 'Type', value: facility?.type ?? '-' },
    { label: 'Capacity', value: facility?.capacity ?? '-' },
    { label: 'Location', value: facility?.location ?? '-' },
    { label: 'Start Time', value: startTime },
    { label: 'End Time', value: endTime },
    { label: 'Description', value: facility?.description || '-' },
    { label: 'Created At', value: formatDate(facility?.createdAt) },
    { label: 'Updated At', value: formatDate(facility?.updatedAt) }
  ];

  return (
    <div className="facility-detail-layout">
      <aside className="facility-detail-sidebar">
        <h1 className="facility-detail-sidebar-title">Operation Hub</h1>
        <nav>
          <span className="facility-detail-nav-link">Facilities</span>
        </nav>
      </aside>

      <main className="facility-detail-main">
        <button type="button" className="facility-detail-back-btn" onClick={handleBack}>
          {'\u2190'} Back to Facilities
        </button>

        {loading && <p className="facility-detail-loading">Loading facility details...</p>}
        {error && <p className="facility-detail-error">{error}</p>}

        {!loading && !error && facility && (
          <div className="facility-detail-card">
            <h2 className="facility-detail-name">{facility.name ?? facility.facilityName ?? 'Facility'}</h2>

            <div className="facility-detail-grid">
              {details.map((item) => (
                <Fragment key={item.label}>
                  <div className="facility-detail-label">{item.label}</div>
                  <div className="facility-detail-value">{item.value}</div>
                </Fragment>
              ))}

              <div className="facility-detail-label">Status</div>
              <div className="facility-detail-value">
                <span className={`facility-detail-status-badge ${isActive ? 'status-active' : 'status-out'}`}>
                  {status}
                </span>
              </div>
            </div>

            <div className="facility-detail-actions">
              <button type="button" className="facility-detail-edit-btn" onClick={() => setShowEditModal(true)}>
                Edit
              </button>
              <button type="button" className="facility-detail-delete-btn" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        )}
      </main>

      {showEditModal && facility && (
        <EditFacilityModal
          facility={facility}
          onClose={() => setShowEditModal(false)}
          onSuccess={fetchFacility}
        />
      )}
    </div>
  );
}

export default FacilityDetail;
