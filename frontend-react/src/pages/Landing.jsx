import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveVehicleMap from '../components/LiveVehicleMap';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import './Landing.css';
import logo from '../assets/translink_logo.jpg';

const LIVE_SHOWCASE_FLEET = [
  {
    bus_id: 1,
    bus_number: 'BUS-101',
    plate_number: 'NY-TR-8801',
    vehicle_type: 'Volvo 9700 Luxury Cruiser',
    driver_name: 'Abebe Bekele',
    driver_phone: '+251 911 234 567',
    route_name: 'Addis Ababa → Bahir Dar',
    origin: 'Addis Ababa',
    destination: 'Bahir Dar',
    status: 'In Transit',
    current_location: {
      lat: 9.6800,
      lng: 38.1300,
      address: 'Gojjam Highway, near Dejen'
    },
    speed: 72,
    heading: 335,
    eta: '3h 45m',
    next_stop: 'Dejen Gorge Rest Station',
    route_coordinates: [
      [9.0300, 38.7400],
      [9.1800, 38.7500],
      [9.6800, 38.1300],
      [10.1600, 38.1400],
      [10.6000, 37.7300],
      [11.5900, 37.3900]
    ]
  },
  {
    bus_id: 2,
    bus_number: 'BUS-102',
    plate_number: 'MA-TR-4422',
    vehicle_type: 'Mercedes-Benz Tourismo',
    driver_name: 'Samuel Tadesse',
    driver_phone: '+251 922 345 678',
    route_name: 'Addis Ababa → Hawassa',
    origin: 'Addis Ababa',
    destination: 'Hawassa',
    status: 'In Transit',
    current_location: {
      lat: 8.2000,
      lng: 38.8800,
      address: 'Hawassa Toll Expressway'
    },
    speed: 85,
    heading: 175,
    eta: '1h 15m',
    next_stop: 'Batu (Ziway) Terminal',
    route_coordinates: [
      [9.0100, 38.7600],
      [8.7500, 38.9800],
      [8.4500, 38.9900],
      [7.9300, 38.7100],
      [7.0600, 38.4800]
    ]
  },
  {
    bus_id: 3,
    bus_number: 'BUS-103',
    plate_number: 'CA-TR-1290',
    vehicle_type: 'Scania Touring HD',
    driver_name: 'Mulugeta Haile',
    driver_phone: '+251 933 456 789',
    route_name: 'Addis Ababa → Dire Dawa',
    origin: 'Addis Ababa',
    destination: 'Dire Dawa',
    status: 'In Transit',
    current_location: {
      lat: 8.9800,
      lng: 40.0500,
      address: 'Awash Valley Highway'
    },
    speed: 64,
    heading: 85,
    eta: '2h 50m',
    next_stop: 'Awash National Park Gate',
    route_coordinates: [
      [9.0100, 38.7600],
      [8.9800, 39.2200],
      [8.9800, 40.0500],
      [9.2300, 40.7500],
      [9.6000, 41.8600]
    ]
  },
  {
    bus_id: 4,
    bus_number: 'BUS-104',
    plate_number: 'IL-TR-9031',
    vehicle_type: 'MCI J4500 Coach',
    driver_name: 'Dawit Tesfaye',
    driver_phone: '+251 944 567 890',
    route_name: 'Addis Ababa → Jimma',
    origin: 'Addis Ababa',
    destination: 'Jimma',
    status: 'In Transit',
    current_location: {
      lat: 8.5400,
      lng: 37.9700,
      address: 'Welkite Mountain Pass'
    },
    speed: 58,
    heading: 240,
    eta: '2h 10m',
    next_stop: 'Abelti River Station',
    route_coordinates: [
      [9.0200, 38.7400],
      [8.7300, 38.3800],
      [8.5400, 37.9700],
      [8.0000, 37.4000],
      [7.6700, 36.8300]
    ]
  }
];

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('buses');
  const [selectedVehicle, setSelectedVehicle] = useState(LIVE_SHOWCASE_FLEET[0]);

  const tabs = [
    { id: 'buses', icon: '🚍', label: t('busFleet') },
    { id: 'routes', icon: '🗺️', label: t('routes') },
    { id: 'schedules', icon: '🕒', label: t('schedules') },
    { id: 'bookings', icon: '🎫', label: t('bookings') },
    { id: 'drivers', icon: '👨‍✈️', label: t('drivers') },
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
          <button className="landing-nav-link btn-link-clean" onClick={() => navigate('/tracking')}>
            📍 {t('liveGpsMap')}
          </button>
          <button className="landing-nav-link btn-link-clean" onClick={() => navigate('/routes')}>
            🗺️ {t('routes')}
          </button>
          <a href="#" className="landing-nav-link">{t('rewards')}</a>
          <LanguageSelector />
          <a href="#" className="landing-nav-link">ETB</a>
          <button className="btn-signin" onClick={() => navigate('/login')}>
            {t('signIn')}
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="landing-hero">
        <h1>
          {t('heroTitlePart1')} <span className="highlight">{t('heroTitlePart2')}</span>
        </h1>
        <p className="subtitle">
          {t('heroSubtitle')}
        </p>

        {/* ===== SEARCH CARD ===== */}
        <div className="search-card">
          {/* Tabs */}
          <div className="search-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`search-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'routes') navigate('/routes');
                }}
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
                placeholder={t('searchPlaceholder')}
              />
            </div>
            <button className="btn-search" onClick={() => navigate('/schedules')}>
              {t('findTrips')}
            </button>
          </div>
        </div>
      </section>

      {/* ===== FEATURES STRIP ===== */}
      <div className="features-strip">
        <div className="feature-item">
          <div className="feature-icon">💰</div>
          <span>{t('bestFares')}</span>
        </div>
        <div className="feature-item">
          <div className="feature-icon">📅</div>
          <span>{t('flexibleDates')}</span>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🔒</div>
          <span>{t('secureBooking')}</span>
        </div>
        <div className="feature-item">
          <div className="feature-icon">📍</div>
          <span>{t('liveGpsTracking')}</span>
        </div>
      </div>

      {/* ===== LIVE TRANSIT NETWORK MAP SHOWCASE SECTION ===== */}
      <section className="landing-map-section">
        <div className="landing-map-container">
          <div className="landing-map-header">
            <div>
              <div className="live-status-pill">
                <span className="pulsing-dot"></span>
                <span>LIVE TELEMETRY NETWORK</span>
              </div>
              <h2 className="landing-map-title">{t('activeTransitCorridors')}</h2>
              <p className="landing-map-subtitle">
                {t('activeTransitSubtitle')}
              </p>
            </div>
            <button
              className="btn-launch-tracker"
              onClick={() => navigate('/tracking')}
            >
              {t('launchFullTracker')}
            </button>
          </div>

          <div className="landing-map-body">
            {/* Left/Top: Vehicle Corridor Selector Cards */}
            <div className="landing-map-sidebar">
              <div className="sidebar-heading">{t('activeIntercityBuses')} ({LIVE_SHOWCASE_FLEET.length})</div>
              <div className="bus-showcase-list">
                {LIVE_SHOWCASE_FLEET.map(v => {
                  const isSelected = selectedVehicle.bus_id === v.bus_id;
                  return (
                    <div
                      key={v.bus_id}
                      className={`bus-showcase-card ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedVehicle(v)}
                    >
                      <div className="bus-card-header">
                        <span className="bus-badge">{v.bus_number}</span>
                        <span className="bus-speed">⚡ {v.speed} km/h</span>
                      </div>
                      <div className="bus-card-route">{v.route_name}</div>
                      <div className="bus-card-meta">
                        <span>📍 {t('nextStop')}: {v.next_stop}</span>
                        <span>⏱️ {t('eta')}: {v.eta}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Bus Quick Info & CTA */}
              <div className="selected-bus-cta-box">
                <div className="cta-vehicle-title">{selectedVehicle.vehicle_type}</div>
                <div className="cta-driver">👨‍✈️ {t('driver')}: {selectedVehicle.driver_name}</div>
                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-sm btn-primary flex-grow-1 rounded-pill"
                    onClick={() => navigate('/schedules')}
                  >
                    {t('bookTrip')}
                  </button>
                  <button
                    className="btn btn-sm btn-outline-light rounded-pill px-3"
                    onClick={() => navigate('/tracking')}
                  >
                    {t('fullView')}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Embedded Interactive Leaflet Map */}
            <div className="landing-map-embed-wrapper">
              <LiveVehicleMap
                vehicles={LIVE_SHOWCASE_FLEET}
                selectedVehicle={selectedVehicle}
                onSelectVehicle={(v) => setSelectedVehicle(v)}
                showAllRoutes={true}
                height="480px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-number">24+</div>
          <div className="stat-label">{t('busesCount')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">12</div>
          <div className="stat-label">{t('activeRoutesCount')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">1.2K+</div>
          <div className="stat-label">{t('happyPassengersCount')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">98%</div>
          <div className="stat-label">{t('onTimeRateCount')}</div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
