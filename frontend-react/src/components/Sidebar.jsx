import React from 'react';
import { Nav } from 'react-bootstrap';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = ({ onNavigate }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();

  const allNavItems = [
    { path: '/dashboard', icon: '📊', label: t('dashboard') },
    { path: '/tracking', icon: '📍', label: t('liveGpsMap'), isLive: true },
    { path: '/buses', icon: '🚍', label: t('busFleet') },
    { path: '/routes', icon: '🗺️', label: t('routes') },
    { path: '/schedules', icon: '🕒', label: t('schedules') },
    { path: '/workers', icon: '🛡️', label: 'Workers', adminOnly: true },
    { path: '/drivers', icon: '👨‍✈️', label: t('drivers'), adminOnly: true },
    { path: '/passengers', icon: '👥', label: t('passengers'), adminOnly: true },
    { 
      path: '/bookings', 
      icon: '🎫', 
      label: user?.role === 'Passenger' ? 'My Bookings & Seats' : t('bookings') 
    },
    { path: '/payments', icon: '💳', label: t('payments'), adminOnly: true },
    { path: '/reports', icon: '📈', label: t('reports'), adminOnly: true },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  // Remove admin-only navigation links for passengers and non-admins
  // Super Admin and Admin both see admin-only items
  const navItems = allNavItems.filter(item => {
    if (item.adminOnly && !isAdmin) return false;
    // Driver doesn't need to book passenger tickets directly from sidebar
    if (user?.role === 'Driver' && item.path === '/bookings') return false;
    return true;
  });

  return (
    <div className="sidebar-wrapper bg-dark text-white p-3 h-100">
      <div className="sidebar-header mb-4 d-none d-lg-block">
        <Link to="/" className="text-decoration-none">
          <h4 className="fw-bold text-primary">Trans<span className="text-info">Link</span></h4>
        </Link>
      </div>
      <div className="sidebar-group-title text-uppercase text-muted small fw-semibold mb-2 px-2" style={{ letterSpacing: '0.08em' }}>
        {t('mainMenu')}
      </div>
      <Nav className="flex-column gap-1">
        {navItems.map(item => (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            onClick={() => onNavigate && onNavigate()}
            className={`text-white sidebar-link d-flex justify-content-between align-items-center ${location.pathname === item.path ? 'active' : ''}`}
          >
            <div>
              <span className="me-2">{item.icon}</span> {item.label}
            </div>
            {item.isLive && (
              <span className="badge bg-success bg-opacity-75 text-white rounded-pill px-2 py-0 fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                ● LIVE
              </span>
            )}
          </Nav.Link>
        ))}
      </Nav>

      <div className="mt-auto pt-4 border-top border-secondary border-opacity-25">
        <Link to="/" className="btn btn-outline-danger btn-sm w-100 rounded-pill">
          🚪 {t('signOut')}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
