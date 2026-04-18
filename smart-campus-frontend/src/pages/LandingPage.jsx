import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import brandLogo from '../Assets/Smart Campus Logo.png';
import '../styles/landing.css';

/**
 * LandingPage Component
 * Public landing page showcasing Smart Campus Operations Hub features
 */
function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/home');
    } else {
      navigate('/signup');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page">
      {/* Header/Navigation */}
      <header className="landing-header">
        <div className="header-container">
          <div className="logo">
            <img src={brandLogo} alt="Smart Campus logo" className="logo-icon" />
            <div className="logo-copy">
              <span className="logo-text">Smart Campus</span>
              <span className="logo-subtext">Operations Hub</span>
            </div>
          </div>
          <nav className="header-nav">
            <a className="nav-link nav-link-active" href="#features">Home</a>
            <a className="nav-link" href="#booking">Booking</a>
            <a className="nav-link" href="#facility">Facility</a>
            <a className="nav-link" href="#tickets">Tickets</a>
            <a className="nav-link" href="#about">About</a>
          </nav>
          <div className="header-buttons">
            <button className="btn-login" onClick={handleLogin}>
              Login
            </button>
            <button className="btn-signup" onClick={handleGetStarted}>
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Smart Campus <span className="hero-highlight">Operations Hub</span>
          </h1>
          <p className="hero-subtitle">
            One simple platform to manage bookings, maintenance tickets, notifications and secure
            access — built for students, faculty and staff.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleGetStarted}>
              Get Started →
            </button>
            <button className="btn-secondary" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-label">Features</h2>
            <h3 className="section-title">Everything your campus needs</h3>
            <p className="section-subtitle">
              A complete toolkit to streamline daily operations across your institution.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon booking">📅</div>
              <h4>Booking Management</h4>
              <p>
                Reserve rooms, labs and equipment in seconds with smart conflict detection.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon maintenance">📧</div>
              <h4>Maintenance Ticketing</h4>
              <p>
                Report issues and track resolutions until every request is fully closed.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon notifications">🔔</div>
              <h4>Notifications</h4>
              <p>
                Stay updated with real-time alerts, broadcasts and personal updates.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon facility">🏢</div>
              <h4>Facility Management</h4>
              <p>
                Monitor campus facilities, schedule usage and keep spaces running smoothly every day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="how-it-works-container">
          <div className="section-header">
            <h2 className="section-label">How it works</h2>
            <h3 className="section-title">Get started in three simple steps</h3>
            <p className="section-subtitle">
              From sign up to your first booking in just a few clicks.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">👤</div>
              <h4>Create your account</h4>
              <p>
                Sign up with your campus email and join your institution in under a minute.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">✨</div>
              <h4>Book or report</h4>
              <p>
                Reserve resources, raise maintenance tickets and stay updated with notifications.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">🚀</div>
              <h4>Get things done</h4>
              <p>
                Track everything from one dashboard and let staff handle requests faster than ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to simplify your campus?</h2>
          <p>
            Join thousands of students and staff already using Smart Campus to get more done, faster.
          </p>
          <div className="cta-buttons">
            <button className="btn-primary-light" onClick={handleGetStarted}>
              Get Started →
            </button>
            <button className="btn-secondary-light" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <p className="footer-text">
              © 2026 Smart Campus Operations Hub. All rights reserved.
            </p>
          </div>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
