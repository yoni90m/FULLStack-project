import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LiveVehicleMap from '../components/LiveVehicleMap';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import './Landing.css';
import logo from '../assets/translink_logo.jpg';
import luxuryBusImg from '../assets/luxury_tour_bus.jpg';
import vipInteriorImg from '../assets/bus_interior_vip.jpg';

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

const POPULAR_CORRIDORS = [
  {
    id: 1,
    origin: 'Addis Ababa',
    destination: 'Bahir Dar',
    distance: '565 km',
    duration: '9h 30m',
    fare: '650.00',
    frequency: 'Daily departures at 08:00 & 14:00',
    coach: 'Volvo 9700 Luxury Cruiser',
    amenities: ['AC & Climate Control', 'High-Speed WiFi', 'Reclining VIP Seats', 'Luggage Cargo']
  },
  {
    id: 2,
    origin: 'Addis Ababa',
    destination: 'Hawassa',
    distance: '275 km',
    duration: '4h 30m',
    fare: '320.00',
    frequency: 'Express expressway transit every 2 hours',
    coach: 'Mercedes-Benz Tourismo',
    amenities: ['Tollway Express', 'USB Charging Ports', 'Panoramic Windows', 'Air Suspended']
  },
  {
    id: 3,
    origin: 'Addis Ababa',
    destination: 'Dire Dawa',
    distance: '445 km',
    duration: '7h 45m',
    fare: '550.00',
    frequency: 'Daily morning & overnight services',
    coach: 'Scania Touring HD',
    amenities: ['Onboard Entertainment', 'Reading Lights', 'GPS Telemetry', 'Beverage Service']
  },
  {
    id: 4,
    origin: 'Addis Ababa',
    destination: 'Jimma',
    distance: '350 km',
    duration: '6h 00m',
    fare: '420.00',
    frequency: 'Daily departures at 06:30 & 12:00',
    coach: 'Volvo 9700 Luxury',
    amenities: ['Scenic Mountain Route', 'AC Cabin', 'Luggage Compartment', 'Rest Stop at Welkite']
  },
  {
    id: 5,
    origin: 'Addis Ababa',
    destination: 'Mekelle',
    distance: '780 km',
    duration: '12h 00m',
    fare: '850.00',
    frequency: 'Direct luxury sleeper coaches',
    coach: 'Setra ComfortClass',
    amenities: ['Executive Sleeper Seats', 'Meal Included', 'Dual Relief Drivers', 'Security Escort']
  },
  {
    id: 6,
    origin: 'Addis Ababa',
    destination: "Debre Mark'os",
    distance: '300 km',
    duration: '5h 30m',
    fare: '380.00',
    frequency: 'Morning & afternoon departures',
    coach: 'MCI J4500 Coach',
    amenities: ['Direct Non-Stop', 'Spacious Legroom', 'Digital Ticketing', 'Full Cargo Hold']
  }
];

const TESTIMONIALS = [
  {
    name: 'Dr. Almaz Kebede',
    role: 'Frequent Business Traveler',
    text: 'TransLink has transformed intercity travel in Ethiopia. Being able to track my coach via live GPS and select my exact chair ahead of time gives complete peace of mind.'
  },
  {
    name: 'Yonas Getachew',
    role: 'Regional Project Engineer',
    text: 'The Volvo luxury coaches between Addis and Bahir Dar are always clean, on time, and very comfortable. Paying with Telebirr and receiving an instant receipt is seamless.'
  },
  {
    name: 'Helina Tadesse',
    role: 'University Lecturer',
    text: 'Outstanding customer service and smooth driving. When I had a schedule question, their 24/7 hotline answered in seconds. Highly recommended for family travel.'
  }
];

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('buses');
  const [selectedVehicle, setSelectedVehicle] = useState(LIVE_SHOWCASE_FLEET[0]);
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDest, setSearchDest] = useState('');

  const tabs = [
    { id: 'buses', icon: '🚍', label: t('busFleet') || 'Bus Fleet' },
    { id: 'routes', icon: '🗺️', label: t('routes') || 'Routes' },
    { id: 'schedules', icon: '🕒', label: t('schedules') || 'Schedules' },
    { id: 'bookings', icon: '🎫', label: t('bookings') || 'Bookings' },
    { id: 'tracking', icon: '📍', label: t('liveGpsMap') || 'Live GPS' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/schedules');
  };

  return (
    <div className="landing-wrapper">
      {/* ===== NAVBAR ===== */}
      <nav className="landing-navbar">
        <Link to="/" className="landing-logo">
          <img src={logo} alt="TransLink Logo" />
          <span className="landing-logo-text">Trans<span>Link</span></span>
        </Link>

        <div className="landing-nav-links">
          <Link to="/" className="landing-nav-link active">
            🏠 {t('home') || 'Home'}
          </Link>
          <Link to="/routes" className="landing-nav-link">
            🗺️ {t('routes') || 'Routes'}
          </Link>
          <Link to="/schedules" className="landing-nav-link">
            🕒 {t('schedules') || 'Schedules'}
          </Link>
          <Link to="/tracking" className="landing-nav-link">
            📍 {t('liveGpsMap') || 'Live Map'}
          </Link>
          <Link to="/contact" className="landing-nav-link">
            📞 {t('contact') || 'Contact Us'}
          </Link>
          <LanguageSelector />
          {isAuthenticated ? (
            <div className="landing-nav-auth-box">
              <span className="landing-user-badge">
                {user?.role === 'Admin' ? '👑 Admin' : user?.role === 'Driver' ? '👨‍✈️ Driver' : '👥 Passenger'}: {user?.username}
              </span>
              <button className="btn-nav-logout" onClick={logout} title="Sign Out">
                🚪 Logout
              </button>
            </div>
          ) : (
            <div className="landing-nav-auth-box">
              <button className="btn-signin-nav" onClick={() => navigate('/login')}>
                🔑 {t('signIn') || 'Sign In'}
              </button>
              <button className="btn-register-nav" onClick={() => navigate('/register')}>
                ✨ {t('register') || 'Register'}
              </button>
            </div>
          )}
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
                  if (tab.id === 'schedules') navigate('/schedules');
                  if (tab.id === 'tracking') navigate('/tracking');
                }}
              >
                <span className="tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input Row */}
          <form onSubmit={handleSearchSubmit} className="search-input-row">
            <div className="search-input-group">
              <span className="input-icon">📍</span>
              <input
                type="text"
                placeholder="From: Addis Ababa, Bahir Dar, Hawassa..."
                value={searchOrigin}
                onChange={e => setSearchOrigin(e.target.value)}
              />
            </div>
            <div className="search-input-group">
              <span className="input-icon">🏁</span>
              <input
                type="text"
                placeholder="To: Dire Dawa, Jimma, Mekelle..."
                value={searchDest}
                onChange={e => setSearchDest(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-search">
              🔍 {t('findTrips') || 'Find Available Buses'}
            </button>
          </form>
        </div>
      </section>


      {/* ===== FLEET HERO SHOWCASE ===== */}
      <section className="fleet-hero-section">
        <div className="fleet-hero-card">
          <div className="fleet-hero-img-wrap">
            <img
              src={luxuryBusImg}
              alt="TransLink luxury intercity coach on Ethiopian mountain highway at golden hour"
              className="fleet-hero-img"
            />
            <div className="fleet-hero-overlay">
              <div className="fleet-hero-live-pill">
                <span className="fleet-pulse-dot"></span> LIVE FLEET NETWORK
              </div>
              <div className="fleet-hero-text-block">
                <h2>Premium Intercity Fleet</h2>
                <p>Experience luxury Volvo, Mercedes-Benz & Scania coaches connecting all major Ethiopian cities with GPS-tracked, climate-controlled comfort.</p>
              </div>
            </div>
          </div>

          <div className="fleet-hero-badges-row">
            <div className="fleet-badge-item">
              <span className="fleet-badge-icon">🛰️</span>
              <span>GPS Tracked</span>
            </div>
            <div className="fleet-badge-item">
              <span className="fleet-badge-icon">❄️</span>
              <span>Climate Controlled</span>
            </div>
            <div className="fleet-badge-item">
              <span className="fleet-badge-icon">📶</span>
              <span>Onboard WiFi</span>
            </div>
            <div className="fleet-badge-item">
              <span className="fleet-badge-icon">💺</span>
              <span>VIP Recliners</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== VIP CABIN EXPERIENCE ===== */}
      <section className="vip-cabin-section">
        <div className="vip-cabin-grid">
          <div className="vip-cabin-img-wrap">
            <img
              src={vipInteriorImg}
              alt="TransLink VIP bus cabin interior with leather recliners and panoramic windows"
              className="vip-cabin-img"
            />
            <div className="vip-cabin-tag">
              <span className="fleet-pulse-dot"></span> VIP CABIN CLASS
            </div>
          </div>

          <div className="vip-cabin-info">
            <div className="vip-section-badge">Passenger Comfort</div>
            <h2 className="vip-cabin-title">VIP Cabin & <span>Fleet Comfort</span></h2>
            <p className="vip-cabin-desc">
              Every TransLink coach features a premium interior designed for long-distance intercity travel. 
              Sink into leather-wrapped recliners with panoramic windows and personalized climate zones.
            </p>

            <div className="vip-amenities-list">
              <div className="vip-amenity-item">
                <span className="vip-check">✓</span>
                <span>Leather reclining seats with extra legroom</span>
              </div>
              <div className="vip-amenity-item">
                <span className="vip-check">✓</span>
                <span>Individual USB & AC power outlets per seat</span>
              </div>
              <div className="vip-amenity-item">
                <span className="vip-check">✓</span>
                <span>Panoramic tinted windows with curtains</span>
              </div>
              <div className="vip-amenity-item">
                <span className="vip-check">✓</span>
                <span>Climate-controlled dual-zone air conditioning</span>
              </div>
              <div className="vip-amenity-item">
                <span className="vip-check">✓</span>
                <span>Overhead reading lights & luggage bins</span>
              </div>
              <div className="vip-amenity-item">
                <span className="vip-check">✓</span>
                <span>25 kg cargo hold baggage allowance</span>
              </div>
            </div>

            <button className="btn-book-experience" onClick={() => navigate('/schedules')}>
              🎫 Book a VIP Seat Now
            </button>
          </div>
        </div>
      </section>

      {/* ===== FEATURES STRIP ===== */}
      <div className="features-strip">
        <div className="feature-item">
          <div className="feature-icon">💰</div>
          <span>{t('bestFares') || 'Guaranteed Best Fares'}</span>
        </div>
        <div className="feature-item">
          <div className="feature-icon">📅</div>
          <span>{t('flexibleDates') || 'Instant Rescheduling'}</span>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🔒</div>
          <span>{t('secureBooking') || 'Telebirr & Card Secured'}</span>
        </div>
        <div className="feature-item">
          <div className="feature-icon">📍</div>
          <span>{t('liveGpsTracking') || 'Live GPS Coach Tracking'}</span>
        </div>
      </div>

      {/* ===== POPULAR DIRECT CORRIDORS SECTION ===== */}
      <section className="popular-corridors-section">
        <div className="section-badge">Featured Transit Corridors</div>
        <h2 className="section-title">Popular Intercity <span>Express Routes</span></h2>
        <p className="section-subtitle">
          Enjoy daily scheduled luxury coach departures connecting major Ethiopian economic hubs with guaranteed seating and real-time tracking.
        </p>

        <div className="corridors-grid">
          {POPULAR_CORRIDORS.map(c => (
            <div key={c.id} className="corridor-card">
              <div className="corridor-header">
                <span className="corridor-badge">Daily Express</span>
                <div className="corridor-fare">
                  ETB {c.fare} <span>/ seat</span>
                </div>
              </div>

              <div className="corridor-cities">
                <span>{c.origin}</span>
                <span className="arrow">→</span>
                <span>{c.destination}</span>
              </div>

              <div className="corridor-meta">
                <span>📏 {c.distance}</span>
                <span>⏱️ {c.duration}</span>
                <span>🚍 {c.coach}</span>
              </div>

              <div className="corridor-amenities">
                {c.amenities.map((a, i) => (
                  <span key={i} className="amenity-tag">✓ {a}</span>
                ))}
              </div>

              <button className="btn-book-corridor" onClick={() => navigate('/schedules')}>
                🎫 Book This Trip
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ===== WHY CHOOSE TRANSLINK SECTION ===== */}
      <section className="why-section">
        <div className="section-badge">The TransLink Advantage</div>
        <h2 className="section-title">Why Commuters <span>Trust Our Fleet</span></h2>
        <p className="section-subtitle">
          Setting the national benchmark for intercity passenger safety, on-time precision, and digital convenience.
        </p>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">🛰️</div>
            <h4>Real-Time Telemetry</h4>
            <p>Every coach transmits live GPS coordinates and speed telemetry, viewable on public OpenStreetMap trackers.</p>
          </div>

          <div className="why-card">
            <div className="why-icon">💺</div>
            <h4>Visual 40-Seat Matrix</h4>
            <p>Select your exact window or aisle chair in advance. No overcrowding, zero standing passengers.</p>
          </div>

          <div className="why-card">
            <div className="why-icon">🛡️</div>
            <h4>Vetted Commercial Drivers</h4>
            <p>All drivers undergo background verification, speed compliance monitoring, and mandatory rest protocols.</p>
          </div>

          <div className="why-card">
            <div className="why-icon">💳</div>
            <h4>Seamless Digital Payments</h4>
            <p>Instant checkout via Telebirr mobile wallet, Commercial Bank of Ethiopia (CBE), and major bank cards.</p>
          </div>
        </div>
      </section>

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

      {/* ===== TESTIMONIALS SECTION ===== */}
      <section className="testimonials-section">
        <div className="section-badge">Verified Passenger Feedback</div>
        <h2 className="section-title">Loved by Thousands of <span>Commuters</span></h2>
        <p className="section-subtitle">
          Real experiences from daily business travelers, university students, and vacationers traveling across Ethiopia.
        </p>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="testimonial-card">
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.name.charAt(0)}</div>
                <div>
                  <div className="author-name">{t.name}</div>
                  <div className="author-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
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

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="footer-brand">
            <div className="d-flex align-items-center gap-2 mb-2">
              <img src={logo} alt="TransLink" style={{ width: 36, height: 36, borderRadius: 8 }} />
              <h3 className="mb-0">Trans<span>Link</span></h3>
            </div>
            <p>
              Ethiopia's premier intercity bus management & seat reservation platform. Connecting Addis Ababa, Bahir Dar, Hawassa, Dire Dawa, Jimma, and Mekelle.
            </p>
          </div>

          <div>
            <div className="footer-heading">Quick Links</div>
            <ul className="footer-links">
              <li><Link to="/">🏠 Home</Link></li>
              <li><Link to="/routes">🗺️ Routes</Link></li>
              <li><Link to="/schedules">🕒 Schedules</Link></li>
              <li><Link to="/tracking">📍 Live Tracking</Link></li>
              <li><Link to="/contact">📞 Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-heading">Passenger Portal</div>
            <ul className="footer-links">
              <li><Link to="/login">🔐 Sign In</Link></li>
              <li><Link to="/register">📝 Register Account</Link></li>
              <li><Link to="/bookings">🎫 My Bookings</Link></li>
              <li><Link to="/settings">⚙️ Settings</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-heading">24/7 Operations</div>
            <ul className="footer-links">
              <li><a href="tel:+251911000111">📞 +251 911 000 111</a></li>
              <li><a href="mailto:support@translink.com">✉️ support@translink.com</a></li>
              <li><Link to="/contact">🏢 Terminal Offices</Link></li>
              <li><span className="text-success small fw-semibold">● Real-time GPS Active</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div>© 2026 TransLink Transportation System. All rights reserved.</div>
          <div>
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms of Carriage</Link>
            <Link to="/contact">Contact Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
