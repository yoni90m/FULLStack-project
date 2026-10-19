import React, { useState } from 'react';
import { Button, Offcanvas, Container } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import LanguageSelector from './components/LanguageSelector';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import LiveTrackingPage from './pages/LiveTrackingPage';
import BusesPage from './pages/BusesPage';
import RoutesPage from './pages/RoutesPage';
import RegisterPage from './pages/RegisterPage';
import BookingsPage from './pages/BookingsPage';
import DriversPage from './pages/DriversPage';
import PassengersPage from './pages/PassengersPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import SchedulesPage from './pages/SchedulesPage';
import WorkersPage from './pages/WorkersPage';
import SettingsPage from './pages/SettingsPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

function AppLayout() {
  const [showSidebar, setShowSidebar] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleClose = () => setShowSidebar(false);
  const handleShow = () => setShowSidebar(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Full-width public and landing pages
  if (location.pathname === '/' || location.pathname === '/home') {
    return <Landing />;
  }
  if (location.pathname === '/contact') {
    return <ContactPage />;
  }
  if (location.pathname === '/login') {
    return <LoginPage />;
  }
  if (location.pathname === '/register') {
    return <RegisterPage />;
  }

  return (
    <div className="app-bg d-flex">
      {/* Desktop Sidebar */}
      <div className="d-none d-lg-block">
        <Sidebar />
      </div>

      {/* Mobile Offcanvas Sidebar */}
      <Offcanvas show={showSidebar} onHide={handleClose} className="d-lg-none bg-dark text-white" style={{ width: '260px' }}>
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title className="fw-bold text-primary">
            Trans<span className="text-info">Link</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Sidebar onNavigate={handleClose} />
        </Offcanvas.Body>
      </Offcanvas>

      <div className="flex-grow-1 overflow-auto w-100">
        {/* Top Navbar */}
        <div className="d-flex justify-content-between align-items-center py-3 px-4 mb-2" style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="d-flex align-items-center gap-3">
            <Button variant="outline-light" size="sm" className="d-lg-none" onClick={handleShow}>☰</Button>
            <h5 className="mb-0 fw-bold text-white d-none d-sm-block">TransLink Management</h5>
          </div>
          <div className="d-flex align-items-center gap-3">
            <LanguageSelector />
            <span className="badge bg-success bg-opacity-25 text-success rounded-pill px-3 py-2 fw-medium border border-success" style={{ fontSize: '0.75rem' }}>
              ● Flask API Live
            </span>
            {isAuthenticated && (
              <>
                <span className="badge bg-primary bg-opacity-10 text-info rounded-pill px-3 py-2 fw-medium">
                  {user?.role} Mode
                </span>
                <div
                  className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center shadow-sm"
                  style={{ width: 38, height: 38, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
                  title={`${user?.username} — Click to sign out`}
                  onClick={handleLogout}
                >
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Page Routes — All protected */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Landing />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tracking" element={<ProtectedRoute><LiveTrackingPage /></ProtectedRoute>} />
          <Route path="/buses" element={<ProtectedRoute><BusesPage /></ProtectedRoute>} />
          <Route path="/routes" element={<ProtectedRoute><RoutesPage /></ProtectedRoute>} />
          <Route path="/schedules" element={<ProtectedRoute><SchedulesPage /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
          <Route path="/drivers" element={<ProtectedRoute roles={['Admin']}><DriversPage /></ProtectedRoute>} />
          <Route path="/workers" element={<ProtectedRoute roles={['Admin', 'Super Admin']}><WorkersPage /></ProtectedRoute>} />
          <Route path="/passengers" element={<ProtectedRoute roles={['Admin']}><PassengersPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute roles={['Admin']}><PaymentsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute roles={['Admin']}><ReportsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
