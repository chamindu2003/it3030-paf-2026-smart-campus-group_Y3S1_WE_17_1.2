import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import BookingRequestPage from './pages/BookingRequestPage';
import UserBookingsPage from './pages/UserBookingsPage';

function App() {
  return (
    <GoogleOAuthProvider clientId="584522305897-e4imhiui27j808mdctedqalbf3bc605e.apps.googleusercontent.com">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected Routes */}
            <Route
              path="/bookings/new"
              element={
                <ProtectedRoute>
                  <BookingRequestPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <UserBookingsPage />
                </ProtectedRoute>
              }
            />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/bookings" replace />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/bookings" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
