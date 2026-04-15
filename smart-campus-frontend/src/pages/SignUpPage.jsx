import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

/**
 * SignUpPage Component
 * Uses AuthContext via useAuth hook for global authentication
 */
function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [success, setSuccess] = useState(null);
  const { register, error, loading, clearError } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    clearError();
    setSuccess(null);

    try {
      await register(name, email, password, role);
      setSuccess('Registration successful! You are now logged in.');

      // Reset form
      setName('');
      setEmail('');
      setPassword('');

      // Redirect to home after registration
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      // Error is handled by useAuth hook
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign Up</h2>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={clearError} className="dismiss-btn">✕</button>
          </div>
        )}

        {success && (
          <div className="success-message">
            <p>{success}</p>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
          />

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

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
            className="role-select"
          >
            <option value="STUDENT">Student</option>
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="auth-link">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;
