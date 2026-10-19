import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';
import ethiopianBusBg from '../assets/ethiopian_bus_login_bg.jpg';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Step 1: email only (exact layout matching reference image)
  // Step 2: details (name, username, password)
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [readMore, setReadMore] = useState(false);

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    const suggestedUsername = email.trim().split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
    setForm(prev => ({ ...prev, username: prev.username || suggestedUsername }));
    setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');
    const { name, phone, username, password, confirmPassword } = form;

    if (!name.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        username: username.trim(),
        password: password
      });
      setSuccessMsg('Account created successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login', {
          state: { registeredMsg: 'Account created! Please sign in to book your bus seats.' }
        });
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed.');
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

        {/* Heading matching screenshot */}
        <h2>Register</h2>

        {/* 3 Value Propositions */}
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

        {error && (
          <div className="flix-alert error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="flix-alert success">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Single Email input field matching screenshot */}
        {step === 1 ? (
          <form onSubmit={handleStep1Submit} className="flix-form">
            <div className="flix-field">
              <label htmlFor="email">Email</label>
              <div className="flix-input-wrap">
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="flix-input"
                  placeholder="name@translink.et"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
            </div>

            <button type="submit" className="flix-btn-continue">
              Continue
            </button>
          </form>
        ) : (
          /* STEP 2: Account details */
          <form onSubmit={handleStep2Submit} className="flix-form">
            <div className="flix-step2-header">
              <span className="flix-step2-email">
                📧 <strong>{email}</strong>
              </span>
              <button
                type="button"
                className="flix-step2-change-btn"
                onClick={() => setStep(1)}
              >
                Change
              </button>
            </div>

            <div className="flix-form-row">
              <div className="flix-field">
                <label htmlFor="name">Full Name *</label>
                <div className="flix-input-wrap">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="flix-input"
                    placeholder="e.g. Abebe Bekele"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="flix-field">
                <label htmlFor="username">Username *</label>
                <div className="flix-input-wrap">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="flix-input"
                    placeholder="e.g. abebe_b"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flix-field">
              <label htmlFor="phone">Phone (Ethiopian Mobile)</label>
              <div className="flix-input-wrap">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="flix-input"
                  placeholder="+251 911 234 567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="flix-form-row">
              <div className="flix-field">
                <label htmlFor="password">Password *</label>
                <div className="flix-input-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="flix-input"
                    placeholder="Min. 6 chars"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flix-field">
                <label htmlFor="confirmPassword">Confirm *</label>
                <div className="flix-input-wrap">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="flix-input"
                    placeholder="Repeat pwd"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="flix-btn-continue" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="flix-spinner"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>
        )}

        {/* Switcher matching screenshot */}
        <div className="flix-switch-wrap">
          <span className="flix-switch-prompt">Already have an account?</span>
          <Link to="/login" className="flix-switch-btn">
            <span>👤</span> Sign in here
          </Link>
        </div>

        {/* Legal Disclaimer */}
        <div className="flix-disclaimer">
          <p>
            We use your email address to send booking confirmations, seat assignments, and trip reminders across Ethiopian bus routes.
          </p>
          <p>
            By creating an account, you agree to our <a href="#">Terms of Carriage</a> and <a href="#">Privacy Policy</a>. TransLink Ethiopian Intercity Bus Transportation System.
          </p>
          {readMore && (
            <p className="flix-read-more-text">
              TransLink provides intercity express coach reservations connecting Addis Ababa, Bahir Dar, Hawassa, Dire Dawa, Gondar, Jimma, and Mekelle with live GPS fleet telemetry.
            </p>
          )}
          <div className="flix-read-more" onClick={() => setReadMore(!readMore)}>
            {readMore ? 'Read less ▴' : 'Read more ⌵'}
          </div>
        </div>

        <Link to="/" className="flix-back-link">
          ← Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
