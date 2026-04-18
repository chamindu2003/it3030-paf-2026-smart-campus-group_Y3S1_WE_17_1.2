import { useNavigate } from 'react-router-dom';
import BookingRequestForm from '../components/BookingRequestForm';

function BookingRequestPage() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>Create Booking</h1>
          <button className="logout-btn" onClick={() => navigate('/bookings')}>
            Back
          </button>
        </div>

        <BookingRequestForm />
      </div>
    </div>
  );
}

export default BookingRequestPage;

