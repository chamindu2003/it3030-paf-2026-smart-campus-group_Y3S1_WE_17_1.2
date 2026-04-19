import { useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../hooks/useAuth';
import { createBooking } from '../api/bookingService';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toLocalDateISO(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function toLocalTimeISO(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
}

function BookingRequestForm() {
  const { user } = useAuth();

  const signedInEmail = useMemo(() => {
    return user?.email || localStorage.getItem('userEmail') || 'Signed-in user';
  }, [user?.email]);

  const [resourceId, setResourceId] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date());
  const [startTime, setStartTime] = useState(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d;
  });
  const [endTime, setEndTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setSeconds(0, 0);
    return d;
  });
  const [purpose, setPurpose] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!resourceId) return setError('Resource is required');
    if (!bookingDate) return setError('Booking date is required');
    if (!startTime || !endTime) return setError('Start and end time are required');

    const bookingPayload = {
      resourceId: Number(resourceId),
      bookingDate: toLocalDateISO(bookingDate),
      startTime: toLocalTimeISO(startTime),
      endTime: toLocalTimeISO(endTime),
      purpose: purpose?.trim() ? purpose.trim() : null,
    };

    setSubmitting(true);
    try {
      const created = await createBooking(bookingPayload);
      setSuccess(`Booking created (id: ${created?.id ?? 'N/A'})`);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Failed to create booking';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="booking-form" onSubmit={onSubmit}>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="booking-identity-note">
        Booking as <strong>{signedInEmail}</strong>. User ID is assigned automatically by the system.
      </div>

      <div className="booking-grid">
        <label className="booking-field">
          <span>Resource</span>
          <select value={resourceId} onChange={(e) => setResourceId(e.target.value)} required>
            <option value="">Select a resource</option>
            <option value="1">Resource 1</option>
            <option value="2">Resource 2</option>
            <option value="3">Resource 3</option>
          </select>
        </label>

        <label className="booking-field">
          <span>Date</span>
          <DatePicker
            selected={bookingDate}
            onChange={(d) => setBookingDate(d)}
            dateFormat="yyyy-MM-dd"
            minDate={new Date()}
            className="booking-datepicker"
          />
        </label>

        <label className="booking-field">
          <span>Start time</span>
          <DatePicker
            selected={startTime}
            onChange={(d) => setStartTime(d)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="HH:mm"
            className="booking-datepicker"
          />
        </label>

        <label className="booking-field">
          <span>End time</span>
          <DatePicker
            selected={endTime}
            onChange={(d) => setEndTime(d)}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="HH:mm"
            className="booking-datepicker"
          />
        </label>

        <label className="booking-field booking-purpose">
          <span>Purpose (optional)</span>
          <input
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Study group meeting"
          />
        </label>
      </div>

      <button className="refresh-btn" type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit booking'}
      </button>
    </form>
  );
}

export default BookingRequestForm;

