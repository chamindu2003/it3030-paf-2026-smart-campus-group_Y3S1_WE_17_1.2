import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GoogleSignInButton from '../components/GoogleSignInButton';
import logo from '../Assets/Smart Campus Logo.png';
import '../styles/login.css';

/**
 * LoginPage Component
 * Supports both traditional email/password login and OAuth 2.0 (Google Sign-In)
 */
function LoginPage() {
  const [email, setEmail] = React.useState('admin@example.com');
  const [password, setPassword] = React.useState('ChangeMeAdmin@2026');
  const [rememberMe, setRememberMe] = React.useState(true);
  const { login, error, loading, clearError, setError, updateUser } = useAuth();
  const navigate = useNavigate();

  const getRoleHomePath = (roleValue) => {
    const normalizedRole = String(roleValue || '').toUpperCase();
    return normalizedRole === 'ADMIN' ? '/home' : '/dashboard';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();

    try {
      const response = await login(email, password);

      // Optional: if user doesn't want remember-me, clear persisted token/user.
      // (Your current auth flow already stores token; this just respects the checkbox.)
      if (!rememberMe) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      // Navigate by role: admin -> /home, others -> /dashboard
      navigate(getRoleHomePath(response?.role || response?.user?.role));
    } catch (err) {
      // Error is handled by useAuth hook
      console.error('Login failed:', err);
    }
  };

  const handleGoogleSuccess = (response) => {
    try {
      console.log('[LoginPage] Google login success handler called');
      console.log('[LoginPage] Full response:', JSON.stringify(response, null, 2));
      
      // Extract token from response
      const token = response?.token;
      
      if (!token) {
        console.error('[LoginPage] ✗ No token received in response');
        setError('Login failed: No authentication token received.');
        return;
      }

      console.log('[LoginPage] ✓ Token found:', token.substring(0, 20) + '...');
      
      // Update context with user data
      console.log('[LoginPage] Updating user context...');
      updateUser(response);

      // Small delay to ensure state updates
      setTimeout(() => {
        const targetPath = getRoleHomePath(response?.role || response?.user?.role);
        console.log('[LoginPage] ✓ Navigating to', targetPath);
        navigate(targetPath);
      }, 100);
      
    } catch (e) {
      console.error('[LoginPage] Exception in handleGoogleSuccess:', e);
      setError('Session error. Please try signing in again.');
    }
  };

  const handleGoogleError = (error) => {
    setError('Google sign-in failed. Please try again.');
    console.error('Google login error:', error);
  };

  return (
    <div className="login-page">
      <main className="login-content">
        <section className="login-shell">
          <aside className="login-brand-panel">
            <div className="brand-top">
              <div className="brand-badge">
                <img src={logo} alt="Smart Campus logo" className="brand-logo" />
              </div>
              <div>
                <h1 className="brand-name">Smart Campus</h1>
                <p className="brand-mini">Operations Hub Access</p>
              </div>
            </div>

            <span className="brand-pill">Trusted campus workflow platform</span>

            <h2 className="brand-title">Secure Access for Better Campus Operations</h2>
            <p className="brand-copy">
              Manage bookings, maintenance requests, and service updates in one professional dashboard.
            </p>

            <div className="brand-feature-grid">
              <span>JWT secured authentication</span>
              <span>Role-based platform access</span>
              <span>Facility workflow ready</span>
              <span>Auditable activity logs</span>
            </div>

            <div className="brand-tags">
              <span>ISO-ready</span>
              <span>24/7 support</span>
              <span>Encrypted data</span>
            </div>
          </aside>

          <section className="login-card" aria-label="Sign in form">
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Sign in to continue managing campus operations and workflows.</p>

            {error && (
              <div className="login-error">
                <p>{error}</p>
                <button type="button" onClick={clearError} aria-label="Dismiss error">✕</button>
              </div>
            )}

            <form className="login-form" onSubmit={handleLogin}>
              <div className="login-field">
                <label htmlFor="email">Email</label>
                <div className="login-input">
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
                  <span>Remember me</span>
                </label>

                <Link className="login-link" to="#" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </Link>
              </div>

              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="login-divider">Or continue with</div>

            <div className="login-oauth">
              <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            </div>

            <div className="login-footer">
              Don&apos;t have an account? <Link to="/signup">Create one</Link>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default LoginPage;
