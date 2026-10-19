import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';
import ethiopianBusBg from '../assets/ethiopian_bus_login_bg.jpg';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const registeredMsg = location.state?.registeredMsg;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const fillDemo = (u, p) => {
    setForm({ username: u, password: p });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username.trim() || !form.password.trim()) {
      setError('Please enter your email or username and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(form.username.trim(), form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flix-auth-page" style={{ backgroundImage: `url(${ethiopianBusBg})` }}>
      <div className="flix-auth-overlay"></div>

      <div className="flix-auth-card">
        {/* Brand Logo Badge */}
        <div className="flix-badge-wrap">
          <div className="flix-logo-badge">TRANSLINK</div>
        </div>

        {/* Heading */}
        <h2>Log in</h2>

        {/* Benefit Checklist */}
        <ul className="flix-checklist">
          <li>
            <span className="flix-check-icon">✓</span>
            <span>Full control over your bookings anytime</span>
          </li>
          <li>
            <span className="flix-check-icon">✓</span>
            <span>Get travel updates & SMS alerts</span>
          </li>
          <li>
            <span className="flix-check-icon">✓</span>
            <span>Track your Ethiopian bus in real-time</span>
          </li>
        </ul>

        {registeredMsg && (
          <div className="flix-alert success">
            <span>🎉</span>
            <span>{registeredMsg}</span>
          </div>
        )}

        {error && (
          <div className="flix-alert error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flix-form">
          <div className="flix-field">
            <label htmlFor="username">Email or Username</label>
            <div className="flix-input-wrap">
              <input
                id="username"
                name="username"
                type="text"
                className="flix-input"
                placeholder="name@translink.et or username"
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                autoFocus
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flix-field">
            <label htmlFor="password">Password</label>
            <div className="flix-input-wrap">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="flix-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="flix-toggle-pwd"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Quick Demo Test Chips */}
          <div className="flix-demo-strip">
            <span className="flix-demo-label">Fast Demo Sign In:</span>
            <div className="flix-demo-btns">
              <button
                type="button"
                className="flix-demo-chip"
                onClick={() => fillDemo('superadmin', 'superadmin123')}
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                className="flix-demo-chip"
                onClick={() => fillDemo('admin', 'admin123')}
              >
                🔑 Admin
              </button>
              <button
                type="button"
                className="flix-demo-chip"
                onClick={() => fillDemo('driver_john', 'driver123')}
              >
                👨‍✈️ Driver
              </button>
              <button
                type="button"
                className="flix-demo-chip"
                onClick={() => fillDemo('alice_smith', 'passenger123')}
              >
                👥 Passenger
              </button>
            </div>
          </div>

          {/* Vibrant Action Button */}
          <button type="submit" className="flix-btn-continue" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="flix-spinner"></span>
                <span>Signing In...</span>
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="flix-switch-wrap">
          <span className="flix-switch-prompt">Don't have an account?</span>
          <Link to="/register" className="flix-switch-btn">
            <span>👤</span> Register here
          </Link>
        </div>

        {/* Disclaimer & Terms */}
        <div className="flix-disclaimer">
          <p>
            We use your email address to send you booking confirmations and schedule updates. You can manage your notification preferences anytime.
          </p>
          <p>
            By logging in, you agree to our <a href="#">Terms & Conditions</a> and <a href="#">Privacy Policy</a>. TransLink Ethiopian Intercity Bus Transportation System.
          </p>
        </div>

        <Link to="/" className="flix-back-link">
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
