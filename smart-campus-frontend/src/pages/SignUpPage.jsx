import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GoogleSignInButton from '../components/GoogleSignInButton';
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
  const role = 'STUDENT';
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
      <header className="signup-header">
        <h1 className="signup-title">Create your account</h1>
        <p className="signup-subtitle">Join Smart Campus Hub to get started</p>
      </header>

      <main className="signup-content">
        <section className="signup-card">
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
                <svg className="signup-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M4.5 20a7.5 7.5 0 0 1 15 0"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
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
              <label htmlFor="email">Email address</label>
              <div className="signup-input">
                <svg className="signup-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

            <div className="signup-field">
              <label htmlFor="password">Password</label>
              <div className="signup-input">
                <svg className="signup-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="signup-field">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="signup-input">
                <svg className="signup-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

            {/* Keep role support, but hide it for now to match the screenshot UI. */}
            <input type="hidden" value={role} readOnly />

            <button className="signup-submit" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
              {!loading && (
                <svg className="signup-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

          <div className="signup-divider">Or continue with</div>

          <div className="signup-oauth">
            <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
          </div>

          <div className="signup-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SignUpPage;
