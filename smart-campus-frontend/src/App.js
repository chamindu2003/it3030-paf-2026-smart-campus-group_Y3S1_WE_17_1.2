import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import FacilitiesList from './pages/FacilitiesList';
import FacilityDetail from './pages/FacilityDetail';

// Google OAuth Client ID - Make sure to set this in environment variables
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id-here';

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
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/home" replace />} />

            <Route path="/facilities" element={<FacilitiesList />} />
            <Route path="/facilities/:id" element={<FacilityDetail />} />
          </Routes>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
