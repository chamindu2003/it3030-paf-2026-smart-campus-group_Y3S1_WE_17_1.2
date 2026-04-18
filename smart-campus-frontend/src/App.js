import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

// IMPORTS
import TicketForm from './components/TicketForm';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail'; // <-- 1. Import your new Detail component

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id-here';

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

                        {/* Test route for creating a ticket */}
                        <Route path="/report" element={<div className="container"><TicketForm /></div>} />

                        {/* Protected Routes */}
                        <Route
                            path="/home"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected route for viewing all tickets */}
                        <Route
                            path="/tickets"
                            element={
                                <ProtectedRoute>
                                    <TicketList />
                                </ProtectedRoute>
                            }
                        />

                        {/* 2. ADDED THIS: Protected route for viewing a single ticket's details & comments */}
                        <Route
                            path="/tickets/:id"
                            element={
                                <ProtectedRoute>
                                    <TicketDetail />
                                </ProtectedRoute>
                            }
                        />

                        {/* Catch-all redirect */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;