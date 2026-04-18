import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import FacilitiesList from './pages/FacilitiesList';
import FacilityDetail from './pages/FacilityDetail';
import FacilitiesPage from './pages/FacilitiesPage';
import BookingRequestPage from './pages/BookingRequestPage';
import UserBookingsPage from './pages/UserBookingsPage';
import AdminBookingPage from './pages/AdminBookingPage';

// TICKET SYSTEM IMPORTS
import TicketForm from './components/TicketForm';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id-here';

function BookingsLanding() {
  const { user } = useAuth();
  const role = String(user?.role || '').trim().toUpperCase();
  return role === 'ADMIN' ? <AdminBookingPage /> : <UserBookingsPage />;
}

function App() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Router>
                <AuthProvider>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/facilities" element={<FacilitiesList />} />
                        <Route path="/facilities/:id" element={<FacilityDetail />} />

                        {/* Ticket System Routes */}
                        <Route path="/report" element={<div className="container"><TicketForm /></div>} />
                        <Route path="/tickets" element={<ProtectedRoute><TicketList /></ProtectedRoute>} />
                        <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />

                        {/* Booking System Routes */}
                        <Route path="/bookings/new" element={<ProtectedRoute><BookingRequestPage /></ProtectedRoute>} />
                        <Route path="/bookings" element={<ProtectedRoute><BookingsLanding /></ProtectedRoute>} />
                        <Route path="/user/facilities" element={<ProtectedRoute><FacilitiesPage /></ProtectedRoute>} />

                        {/* Dashboard Routes */}
                        <Route path="/home" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/home/users" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

                        {/* Catch-all redirect */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;