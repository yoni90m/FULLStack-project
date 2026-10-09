import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';
import logo from '../assets/translink_logo.jpg';

const Landing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('buses');

  const tabs = [
    { id: 'buses', icon: '🚍', label: 'Buses' },
    { id: 'routes', icon: '🗺️', label: 'Routes' },
    { id: 'schedules', icon: '🕒', label: 'Schedules' },
    { id: 'bookings', icon: '🎫', label: 'Bookings' },
    { id: 'drivers', icon: '👨‍✈️', label: 'Drivers' },
    { id: 'packages', icon: '📦', label: 'Packages' },
  ];

  return (
    <div className="landing-wrapper">
      {/* ===== NAVBAR ===== */}
      <nav className="landing-navbar">
        <a href="/" className="landing-logo">
          <img src={logo} alt="TransLink Logo" />
          <span className="landing-logo-text">Trans<span>Link</span></span>
        </a>

        <div className="landing-nav-links">
          <a href="#" className="landing-nav-link">Rewards</a>
          <a href="#" className="landing-nav-link">
            <span className="lang-badge">🌐 EN ▾</span>
          </a>
          <a href="#" className="landing-nav-link">ETB</a>
          <button className="btn-signin" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="landing-hero">
        <h1>
          Go Smart | <span className="highlight">Spend Less</span>
        </h1>
        <p className="subtitle">
          Book buses, manage routes & more — all in one place.
        </p>

        {/* ===== SEARCH CARD ===== */}
        <div className="search-card">
          {/* Tabs */}
          <div className="search-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`search-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input Row */}
          <div className="search-input-row">
            <div className="search-input-group">
              <span className="input-icon">📍</span>
              <input
                type="text"
                placeholder="Where do you want to go? (e.g. Bahir Dar, Hawassa, Mekelle)"
              />
            </div>
            <button className="btn-search" onClick={() => navigate('/schedules')}>
              🔍 FIND TRIPS
            </button>
          </div>
        </div>
      </section>

      {/* ===== FEATURES STRIP ===== */}
      <div className="features-strip">
        <div className="feature-item">
          <div className="feature-icon">💰</div>
          <span>Best Fares</span>
        </div>
        <div className="feature-item">
          <div className="feature-icon">📅</div>
          <span>Flexible Dates</span>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🔒</div>
          <span>Secure Booking</span>
        </div>
        <div className="feature-item">
          <div className="feature-icon">✅</div>
          <span>Travel with Confidence</span>
        </div>
      </div>

      {/* ===== STATS BAR ===== */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-number">24+</div>
          <div className="stat-label">Buses</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">12</div>
          <div className="stat-label">Active Routes</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">1.2K+</div>
          <div className="stat-label">Happy Passengers</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">98%</div>
          <div className="stat-label">On-Time Rate</div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
