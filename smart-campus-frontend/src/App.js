import { useState } from 'react';
import './App.css';
import authService from './api/authService';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';

// Main App Component
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());
  const [user, setUser] = useState(authService.getCurrentUser());
  const [activePage, setActivePage] = useState('login');

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
    setActivePage('login');
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <HomePage user={user} onLogout={handleLogout} />
      ) : (
        <>
          {activePage === 'signup' ? (
            <SignUpPage onSignUpSuccess={() => setActivePage('login')} />
          ) : (
            <LoginPage onLoginSuccess={handleLoginSuccess} />
          )}

          <button
            className="toggle-btn global-toggle"
            onClick={() => setActivePage((prev) => (prev === 'login' ? 'signup' : 'login'))}
          >
            {activePage === 'signup' ? 'Already have account? Login' : "Don't have account? Sign up"}
          </button>
        </>
      )}
    </div>
  );
}

export default App;
