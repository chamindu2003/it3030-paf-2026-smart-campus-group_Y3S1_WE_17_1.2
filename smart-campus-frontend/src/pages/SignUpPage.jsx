import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GoogleSignInButton from '../components/GoogleSignInButton';
import logo from '../Assets/Smart Campus Logo.png';
import '../styles/signup.css';

/**
 * SignUpPage Component
 * Uses AuthContext via useAuth hook for global authentication
 */
function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [success, setSuccess] = useState(null);
  const { register, error, loading, clearError, setError } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    clearError();
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      await register(name, email, password, role);
      setSuccess('Registration successful! You are now logged in.');

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('USER');

      // Redirect to home after registration
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      // Error is handled by useAuth hook
      console.error('Registration failed:', err);
    }
  };

  const handleGoogleSuccess = () => {
    navigate('/home');
  };

  const handleGoogleError = () => {
    setError('Google sign-up failed. Please try again.');
  };

  return (
    <div className="signup-page">
      <main className="signup-content">
        <section className="signup-shell">
          <aside className="signup-brand-panel">
            <div className="signup-brand-top">
              <div className="signup-brand-badge">
                <img src={logo} alt="Smart Campus logo" className="signup-brand-logo" />
              </div>
              <div>
                <h1 className="signup-brand-name">Smart Campus</h1>
                <p className="signup-brand-mini">Operations Hub Access</p>
              </div>
            </div>

            <span className="signup-brand-pill">Trusted campus workflow platform</span>

            <h2 className="signup-brand-title">Create Your Campus Access Profile</h2>
            <p className="signup-brand-copy">
              Register to manage bookings, maintenance requests, and service coordination in one secure dashboard.
            </p>

            <div className="signup-feature-grid">
              <span>Role-based onboarding</span>
              <span>Secure account creation</span>
              <span>Facility workflow ready</span>
              <span>Auditable account activity</span>
            </div>

            <div className="signup-brand-tags">
              <span>ISO-ready</span>
              <span>24/7 support</span>
              <span>Encrypted data</span>
            </div>
          </aside>

          <section className="signup-card" aria-label="Sign up form">
            <h2 className="signup-form-title">Create account</h2>
            <p className="signup-form-subtitle">Join Smart Campus Hub to get started.</p>

            {error && (
              <div className="signup-error">
                <p>{error}</p>
                <button type="button" onClick={clearError} aria-label="Dismiss error">✕</button>
              </div>
            )}

            {success && <div className="signup-success">{success}</div>}

            <form className="signup-form" onSubmit={handleRegister}>
              <div className="signup-field">
                <label htmlFor="name">Full name</label>
                <div className="signup-input">
                  <input
                    id="name"
                    type="text"
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="signup-field">
                <label htmlFor="email">Email</label>
                <div className="signup-input">
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

              <div className="signup-field">
                <label htmlFor="password">Password</label>
                <div className="signup-input">
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="signup-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <div className="signup-input">
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="signup-field">
                <label htmlFor="role">Role</label>
                <div className="signup-input signup-select-wrap">
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                    required
                  >
                    <option value="USER">User</option>
                    <option value="TECHNICIAN">Technician</option>
                  </select>
                </div>
              </div>

              <button className="signup-submit" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="signup-divider">Or continue with</div>

            <div className="signup-oauth">
              <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            </div>

            <div className="signup-footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default SignUpPage;
