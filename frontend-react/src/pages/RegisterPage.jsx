import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css'; // reuse login styles

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccessMsg('');
  };

  const validate = () => {
    const { name, email, phone, username, password, confirmPassword } = form;
    if (!name.trim() || !email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      return 'All fields except phone are required.';
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format.';
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (phone && !phoneRegex.test(phone)) return 'Invalid phone number.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        username: form.username.trim(),
        password: form.password
      };
      await register(payload);
      setSuccessMsg('Account created! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { state: { registeredMsg: 'Your account has been created. Please log in.' } });
      }, 1500);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card register-card">
        <div className="login-header">
          <h2>Passenger Registration</h2>
          <p className="login-subtitle">Join TransLink and start traveling</p>
        </div>
        {error && (
          <div className="login-alert">
            <span className="alert-icon">⚠️</span>{error}
          </div>
        )}
        {successMsg && (
          <div className="login-alert success">
            <span className="alert-icon">✅</span>{successMsg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input id="name" name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} disabled={isLoading} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} disabled={isLoading} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number (optional)</label>
            <div className="input-wrapper">
              <span className="input-icon">📞</span>
              <input id="phone" name="phone" type="tel" placeholder="+1234567890" value={form.phone} onChange={handleChange} disabled={isLoading} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <span className="input-icon">🆔</span>
              <input id="username" name="username" type="text" placeholder="Pick a username" value={form.username} onChange={handleChange} disabled={isLoading} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input id="password" name="password" type="password" placeholder="Choose a password" value={form.password} onChange={handleChange} disabled={isLoading} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Retype password" value={form.confirmPassword} onChange={handleChange} disabled={isLoading} />
            </div>
          </div>
          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <><span className="spinner" /> Registering...</> : 'Register'}
          </button>
          <div className="login-register-prompt">
            <span>Already have an account? </span>
            <Link to="/login" className="register-link">Log In here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
