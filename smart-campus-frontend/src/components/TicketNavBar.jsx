import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const TicketNavBar = ({ currentPage }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const role = String(user?.role || '').toUpperCase();

  const homePath = useMemo(() => {
    if (role === 'ADMIN') return '/home';
    if (role === 'TECHNICIAN') return '/dashboard';
    return '/dashboard';
  }, [role]);

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { label: 'Tickets', to: '/tickets', key: 'list' },
    { label: 'Report Ticket', to: '/report', key: 'report' },
  ];

  if (role === 'TECHNICIAN') {
    navItems.push({ label: 'My Tasks', to: '/my-tasks', key: 'tasks' });
  }

  return (
    <nav className="ticket-navbar" aria-label="Ticket navigation">
      <div className="ticket-navbar-left">
        {navItems.map((item) => (
          <Link
            key={item.key}
            to={item.to}
            className={`ticket-nav-link ${currentPage === item.key ? 'active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="ticket-navbar-right">
        <button
          type="button"
          className="ticket-nav-button"
          onClick={() => navigate(homePath)}
        >
          Dashboard
        </button>
        <span className="ticket-nav-user">{user?.name || user?.email || 'Account'}</span>
        <button
          type="button"
          className="ticket-nav-logout"
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

TicketNavBar.propTypes = {
  currentPage: PropTypes.string,
};

TicketNavBar.defaultProps = {
  currentPage: '',
};

export default TicketNavBar;
