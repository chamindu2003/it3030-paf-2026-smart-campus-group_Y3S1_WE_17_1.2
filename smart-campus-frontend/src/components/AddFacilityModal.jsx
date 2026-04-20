import { useState } from 'react';
import axios from 'axios';
import '../styles/AddFacilityModal.css';

const FACILITIES_API_URL = 'http://localhost:8081/api/facilities';

const formatDateTimeForApi = (dateTimeLocal) => {
  if (!dateTimeLocal) {
    return '';
  }

  return dateTimeLocal.replace('T', ' ');
};

const formatTimeForApi = (timeValue) => {
  if (!timeValue) {
    return '';
  }

  return timeValue;
};

const getTodayMinDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}T00:00`;
};

function AddFacilityModal({ onClose, onSuccess }) {
  const minSelectableDateTime = getTodayMinDateTime();

  const [formData, setFormData] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: '',
    location: '',
    status: 'ACTIVE',
    description: ''
  });
  const [availabilityStart, setAvailabilityStart] = useState('');
  const [availabilityEnd, setAvailabilityEnd] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const isEquipmentType = formData.type === 'EQUIPMENT';

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === 'type' && value === 'EQUIPMENT') {
      setFormData((prev) => ({
        ...prev,
        type: value,
        capacity: ''
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');

    if ((availabilityStart && !availabilityEnd) || (!availabilityStart && availabilityEnd)) {
      setError('Please select both start and end date/time for availability.');
      return;
    }

    setIsSaving(true);

    const availabilityWindows =
      availabilityStart && availabilityEnd
        ? `${formatDateTimeForApi(availabilityStart)} - ${formatTimeForApi(availabilityEnd)}`
        : '';

    const payload = {
      ...formData,
      availabilityWindows,
      capacity: isEquipmentType ? null : (formData.capacity === '' ? '' : Number(formData.capacity))
    };

    try {
      await axios.post(FACILITIES_API_URL, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create facility.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="add-facility-modal-overlay">
      <div className="add-facility-modal-box" role="dialog" aria-modal="true" aria-label="Add New Facility">
        <div className="add-facility-modal-header">
          <h3 className="add-facility-modal-title">New Facility</h3>
          <button type="button" className="add-facility-close-btn" onClick={onClose} aria-label="Close modal">
            X
          </button>
        </div>

        <form onSubmit={handleSave} className="add-facility-form">
          <div className="add-facility-grid-row">
            <div className="add-facility-field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="add-facility-field">
              <label htmlFor="type">Type</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange}>
                <option value="LECTURE_HALL">LECTURE_HALL</option>
                <option value="LAB">LAB</option>
                <option value="MEETING_ROOM">MEETING_ROOM</option>
                <option value="EQUIPMENT">EQUIPMENT</option>
              </select>
            </div>
          </div>

          {isEquipmentType ? (
            <div className="add-facility-field">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          ) : (
            <div className="add-facility-grid-row">
              <div className="add-facility-field">
                <label htmlFor="capacity">Capacity</label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="add-facility-field">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="add-facility-field">
            <div className="add-facility-grid-row">
              <div className="add-facility-field">
                <label htmlFor="availabilityStart">Start Time</label>
                <input
                  id="availabilityStart"
                  name="availabilityStart"
                  type="datetime-local"
                  min={minSelectableDateTime}
                  value={availabilityStart}
                  onChange={(event) => setAvailabilityStart(event.target.value)}
                />
              </div>

              <div className="add-facility-field">
                <label htmlFor="availabilityEnd">End Time</label>
                <input
                  id="availabilityEnd"
                  name="availabilityEnd"
                  type="time"
                  value={availabilityEnd}
                  onChange={(event) => setAvailabilityEnd(event.target.value)}
                />
              </div>
            </div>
            <p className="add-facility-help">Select start date/time and end time only.</p>
          </div>

          <div className="add-facility-field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </select>
          </div>

          <div className="add-facility-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          {error && <p className="add-facility-error">{error}</p>}

          <div className="add-facility-actions">
            <button type="button" className="add-facility-cancel-btn" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="add-facility-save-btn" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddFacilityModal;
