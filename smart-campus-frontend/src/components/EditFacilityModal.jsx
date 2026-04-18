import { useState } from 'react';
import axios from 'axios';
import '../styles/EditFacilityModal.css';

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

const toDateTimeLocal = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(trimmed)) {
    return trimmed.replace(' ', 'T');
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const parseAvailabilityWindows = (value) => {
  if (!value || typeof value !== 'string') {
    return { start: '', end: '' };
  }

  const parts = value.split(' - ');

  if (parts.length !== 2) {
    return { start: '', end: '' };
  }

  return {
    start: toDateTimeLocal(parts[0]),
    end: toTimeInputValue(parts[1])
  };
};

const toTimeInputValue = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();

  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed.slice(11);
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(trimmed)) {
    return trimmed.slice(11);
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
};

function EditFacilityModal({ facility, onClose, onSuccess }) {
  const minSelectableDateTime = getTodayMinDateTime();
  const initialAvailabilityValue =
    facility?.availabilityWindows ?? facility?.availabilityWindow ?? facility?.availability ?? '';
  const parsedAvailability = parseAvailabilityWindows(initialAvailabilityValue);

  const [formData, setFormData] = useState({
    name: facility?.name ?? facility?.facilityName ?? '',
    type: facility?.type ?? 'LECTURE_HALL',
    capacity: facility?.capacity ?? '',
    location: facility?.location ?? '',
    availabilityWindows: initialAvailabilityValue,
    status: facility?.status ?? 'ACTIVE',
    description: facility?.description ?? ''
  });
  const [availabilityStart, setAvailabilityStart] = useState(parsedAvailability.start);
  const [availabilityEnd, setAvailabilityEnd] = useState(parsedAvailability.end);
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

  const handleUpdate = async (event) => {
    event.preventDefault();
    setError('');

    if ((availabilityStart && !availabilityEnd) || (!availabilityStart && availabilityEnd)) {
      setError('Please select both start and end date/time for availability.');
      return;
    }

    setIsSaving(true);

    const facilityId = facility?.id ?? facility?.facilityId;
    const availabilityWindows =
      availabilityStart && availabilityEnd
        ? `${formatDateTimeForApi(availabilityStart)} - ${formatTimeForApi(availabilityEnd)}`
        : formData.availabilityWindows;

    const payload = {
      ...formData,
      availabilityWindows,
      capacity: isEquipmentType ? null : (formData.capacity === '' ? '' : Number(formData.capacity))
    };

    try {
      await axios.put(`${FACILITIES_API_URL}/${facilityId}`, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update facility.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="edit-facility-modal-overlay">
      <div className="edit-facility-modal-box" role="dialog" aria-modal="true" aria-label="Edit Facility">
        <div className="edit-facility-modal-header">
          <h3 className="edit-facility-modal-title">Edit Facility</h3>
          <button type="button" className="edit-facility-close-btn" onClick={onClose} aria-label="Close modal">
            X
          </button>
        </div>

        <form onSubmit={handleUpdate} className="edit-facility-form">
          <div className="edit-facility-grid-row">
            <div className="edit-facility-field">
              <label htmlFor="edit-name">Name</label>
              <input
                id="edit-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="edit-facility-field">
              <label htmlFor="edit-type">Type</label>
              <select id="edit-type" name="type" value={formData.type} onChange={handleChange}>
                <option value="LECTURE_HALL">LECTURE_HALL</option>
                <option value="LAB">LAB</option>
                <option value="MEETING_ROOM">MEETING_ROOM</option>
                <option value="EQUIPMENT">EQUIPMENT</option>
              </select>
            </div>
          </div>

          {isEquipmentType ? (
            <div className="edit-facility-field">
              <label htmlFor="edit-location">Location</label>
              <input
                id="edit-location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          ) : (
            <div className="edit-facility-grid-row">
              <div className="edit-facility-field">
                <label htmlFor="edit-capacity">Capacity</label>
                <input
                  id="edit-capacity"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="edit-facility-field">
                <label htmlFor="edit-location">Location</label>
                <input
                  id="edit-location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div className="edit-facility-field">
            <div className="edit-facility-grid-row">
              <div className="edit-facility-field">
                <label htmlFor="edit-availabilityStart">Start Time</label>
                <input
                  id="edit-availabilityStart"
                  name="edit-availabilityStart"
                  type="datetime-local"
                  min={minSelectableDateTime}
                  value={availabilityStart}
                  onChange={(event) => setAvailabilityStart(event.target.value)}
                />
              </div>

              <div className="edit-facility-field">
                <label htmlFor="edit-availabilityEnd">End Time</label>
                <input
                  id="edit-availabilityEnd"
                  name="edit-availabilityEnd"
                  type="time"
                  value={availabilityEnd}
                  onChange={(event) => setAvailabilityEnd(event.target.value)}
                />
              </div>
            </div>
            {!availabilityStart && !availabilityEnd && formData.availabilityWindows && (
              <p className="edit-facility-help">Current value: {formData.availabilityWindows}</p>
            )}
            <p className="edit-facility-help">Select start date/time and end time only.</p>
          </div>

          <div className="edit-facility-field">
            <label htmlFor="edit-status">Status</label>
            <select id="edit-status" name="status" value={formData.status} onChange={handleChange}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
            </select>
          </div>

          <div className="edit-facility-field">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          {error && <p className="edit-facility-error">{error}</p>}

          <div className="edit-facility-actions">
            <button type="button" className="edit-facility-cancel-btn" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="edit-facility-update-btn" disabled={isSaving}>
              {isSaving ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditFacilityModal;
