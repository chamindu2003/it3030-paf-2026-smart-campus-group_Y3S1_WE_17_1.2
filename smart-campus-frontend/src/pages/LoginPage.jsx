import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GoogleSignInButton from '../components/GoogleSignInButton';
import '../styles/login.css';

/**
 * LoginPage Component
 * Supports both traditional email/password login and OAuth 2.0 (Google Sign-In)
 */
function LoginPage() {
  const [email, setEmail] = React.useState('admin@example.com');
  const [password, setPassword] = React.useState('admin123');
  const [rememberMe, setRememberMe] = React.useState(true);
  const { login, error, loading, clearError, setError } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await login(email, password);

      // Optional: if user doesn't want remember-me, clear persisted token/user.
      // (Your current auth flow already stores token; this just respects the checkbox.)
      if (!rememberMe) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      // Navigate to bookings on success
      navigate('/bookings');
    } catch (err) {
      // Error is handled by useAuth hook
      console.error('Login failed:', err);
    }
  };

  const handleGoogleSuccess = (response) => {
    console.log('Google login successful');
    navigate('/bookings');
  };

  const handleGoogleError = (error) => {
    setError('Google sign-in failed. Please try again.');
    console.error('Google login error:', error);
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <h1 className="login-title">Smart Campus Hub</h1>
        <p className="login-subtitle">Sign in to manage campus operations</p>
      </header>

      <main className="login-content">
        <section className="login-card">
          {error && (
            <div className="login-error">
              <p>{error}</p>
              <button type="button" onClick={clearError} aria-label="Dismiss error">✕</button>
            </div>
          )}

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="email">Email address</label>
              <div className="login-input">
                <svg className="login-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 6.5h16v11H4v-11Z" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                <input
                  id="email"
                  type="email"
                  placeholder="you@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input">
                <svg className="login-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M7.5 11V8.5a4.5 4.5 0 0 1 9 0V11"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.5 11h11a1.5 1.5 0 0 1 1.5 1.5v6A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-6A1.5 1.5 0 0 1 6.5 11Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="login-row">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                Remember me
              </label>

              {/* If you implement a forgot-password route later, change this Link target */}
              <Link className="login-link" to="#" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </Link>
            </div>

            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && (
                <svg className="login-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path
                    d="m13 6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </form>

          <div className="login-divider">Or continue with</div>

          <div className="login-oauth">
            <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          </div>

          <div className="login-footer">
            Don&apos;t have an account? <Link to="/signup">Sign up</Link>
          </div>

          {/* Optional: add helper buttons here later */}
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
