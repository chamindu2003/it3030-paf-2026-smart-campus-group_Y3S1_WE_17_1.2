import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GoogleSignInButton from '../components/GoogleSignInButton';
import '../styles/auth.css';

/**
 * LoginPage Component
 * Supports both traditional email/password login and OAuth 2.0 (Google Sign-In)
 */
function LoginPage() {
  const [email, setEmail] = React.useState('admin@example.com');
  const [password, setPassword] = React.useState('admin123');
  const { login, error, loading, clearError, setError } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);
      // Navigate to home on success
      navigate('/home');
    } catch (err) {
      // Error is handled by useAuth hook
      console.error('Login failed:', err);
    }
  };

  const handleTestLogin = async () => {
    clearError();
    try {
      await login('admin@example.com', 'admin123');
      navigate('/home');
    } catch (err) {
      console.error('Test login failed:', err);
    }
  };

  const handleGoogleSuccess = (response) => {
    console.log('Google login successful');
    navigate('/home');
  };

  const handleGoogleError = (error) => {
    setError('Google sign-in failed. Please try again.');
    console.error('Google login error:', error);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={clearError} className="dismiss-btn">✕</button>
          </div>
        )}

        {/* Google Sign-In Section */}
        <div className="oauth-section">
          <h3>Sign in with</h3>
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        {/* Divider */}
        <div className="divider">
          <span>or</span>
        </div>

        {/* Traditional Email/Password Form */}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-link">
          <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
