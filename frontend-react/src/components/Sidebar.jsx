import React from 'react';
import { Nav } from 'react-bootstrap';
import { useLocation, Link } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/tracking', icon: '📍', label: 'Live GPS Map', isLive: true },
  { path: '/buses', icon: '🚍', label: 'Bus Fleet' },
  { path: '/routes', icon: '🗺️', label: 'Routes' },
  { path: '/schedules', icon: '🕒', label: 'Schedules' },
  { path: '/drivers', icon: '👨‍✈️', label: 'Drivers' },
  { path: '/passengers', icon: '👥', label: 'Passengers' },
  { path: '/bookings', icon: '🎫', label: 'Bookings & Seats' },
  { path: '/payments', icon: '💳', label: 'Payments' },
  { path: '/reports', icon: '📈', label: 'Analytics & Reports' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="sidebar-wrapper bg-dark text-white p-3 h-100">
      <div className="sidebar-header mb-4 d-none d-lg-block">
        <Link to="/" className="text-decoration-none">
          <h4 className="fw-bold text-primary">Trans<span className="text-info">Link</span></h4>
        </Link>
      </div>
      <div className="sidebar-group-title text-uppercase text-muted small fw-semibold mb-2 px-2" style={{ letterSpacing: '0.08em' }}>Main Menu</div>
      <Nav className="flex-column gap-1">
        {navItems.map(item => (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
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
          🚪 Sign Out
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
