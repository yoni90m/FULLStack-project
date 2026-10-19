import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import logo from '../assets/translink_logo.jpg';
import dispatchHubImg from '../assets/contact_support_hub.jpg';
import './ContactPage.css';

const REGIONAL_STATIONS = [
  {
    city: 'Addis Ababa (HQ Terminal)',
    address: 'Meskel Square & Autobus Tera Gateway, Bole Road',
    phone: '+251 115 500 000 / +251 911 000 111',
    hours: '24/7 Operations & Dispatch'
  },
  {
    city: 'Bahir Dar Hub',
    address: 'Lake Tana Intercity Terminal, Kebele 04 Avenue',
    phone: '+251 582 201 199',
    hours: '05:30 AM – 09:30 PM'
  },
  {
    city: 'Hawassa Terminal',
    address: 'Southern Express Depot, Main Piazza Highway',
    phone: '+251 462 120 440',
    hours: '06:00 AM – 09:00 PM'
  },
  {
    city: 'Dire Dawa Station',
    address: 'Eastern Railway & Coach Square, Kezira Commercial District',
    phone: '+251 251 114 888',
    hours: '06:00 AM – 10:00 PM'
  },
  {
    city: 'Jimma Terminal',
    address: 'Oromia Coffee Transit Corridor, Aba Jifar Boulevard',
    phone: '+251 471 113 222',
    hours: '06:00 AM – 08:30 PM'
  },
  {
    city: 'Mekelle Station',
    address: 'Northern Transit Station, Romanat Square Highway',
    phone: '+251 344 402 777',
    hours: '06:00 AM – 08:00 PM'
  }
];

const FAQS = [
  {
    q: 'How do I cancel or reschedule my reserved bus ticket?',
    a: 'Tickets can be rescheduled or cancelled up to 2 hours before scheduled departure directly through your dashboard under Bookings & Seats, or by contacting our 24/7 hotline.'
  },
  {
    q: 'What is the maximum allowed baggage per passenger?',
    a: 'Each passenger is entitled to 1 primary luggage item up to 25 kg stored in the lower cargo hold, plus 1 personal carry-on bag in the overhead cabin bins at no extra cost.'
  },
  {
    q: 'What should I do if I forgot an item on a bus?',
    a: 'Submit a message immediately through this contact form selecting "Lost & Found Luggage", include your trip booking reference (e.g. TRIP-88201) and seat number. Our dispatcher will contact the driver.'
  },
  {
    q: 'Which payment methods are accepted for ticket booking?',
    a: 'We accept instant Telebirr mobile wallet, CBE Mobile Banking, major debit/credit cards, and cash payments at our terminal ticket counters.'
  }
];

const ContactPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: user?.username || '',
    email: user?.email || '',
    phone: '',
    subject: 'Ticket Reservation & Seat Queries',
    booking_reference: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successInquiry, setSuccessInquiry] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please provide your name, email, and detailed message.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/reports/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit contact request.');
      }
      setSuccessInquiry(data.data || { id: 'INQ-' + Date.now().toString().slice(-6), ...form });
    } catch (err) {
      setError(err.message || 'Unable to deliver message right now. Please call our hotline.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyInquiryId = () => {
    if (successInquiry?.id) {
      navigator.clipboard.writeText(successInquiry.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="contact-wrapper">
      {/* ===== NAVBAR ===== */}
      <nav className="contact-navbar">
        <Link to="/" className="contact-logo">
          <img src={logo} alt="TransLink Logo" />
          <span className="contact-logo-text">Trans<span>Link</span></span>
        </Link>

        <div className="contact-nav-links">
          <Link to="/" className="contact-nav-link">🏠 {t('home') || 'Home'}</Link>
          <Link to="/routes" className="contact-nav-link">🗺️ {t('routes')}</Link>
          <Link to="/schedules" className="contact-nav-link">🕒 {t('schedules')}</Link>
          <Link to="/tracking" className="contact-nav-link">📍 {t('liveGpsMap')}</Link>
          <Link to="/contact" className="contact-nav-link active">📞 {t('contact') || 'Contact Us'}</Link>
          <LanguageSelector />
          {isAuthenticated ? (
            <button className="btn-contact-action" onClick={() => navigate('/dashboard')}>
              📊 Dashboard
            </button>
          ) : (
            <button className="btn-contact-action" onClick={() => navigate('/login')}>
              {t('signIn')}
            </button>
          )}
        </div>
      </nav>

      {/* ===== HERO & OPERATIONS HUB BANNER ===== */}
      <section className="contact-hero">
        <div className="contact-pill-badge">
          <span className="badge-pulse-green"></span> 24/7 National Operations & Dispatch Command
        </div>
        <h1>
          We Are Here To <span>Assist Your Journey</span>
        </h1>
        <p>
          Need help booking tickets, tracking intercity coaches, inquiring about freight, or resolving trip issues?
          Our command dispatch officers and customer care team are ready around the clock.
        </p>

        {/* Dispatch Hub Visual Card */}
        <div className="dispatch-showcase-card">
          <div className="dispatch-img-container">
            <img 
              src={dispatchHubImg} 
              alt="TransLink 24/7 Central Operations Dispatch Control Center" 
              className="dispatch-img"
            />
            <div className="dispatch-img-overlay">
              <div className="dispatch-live-badge">
                <span className="badge-pulse-green"></span> LIVE DISPATCH COMMAND
              </div>
              <div className="dispatch-img-caption">
                <h3>TransLink Central Operations & Fleet Monitoring Center</h3>
                <p>Meskel Square Regional Headquarters • Addis Ababa, Ethiopia</p>
              </div>
            </div>
          </div>

          <div className="dispatch-stats-bar">
            <div className="dispatch-stat">
              <span className="stat-value">24 / 7</span>
              <span className="stat-title">Active Monitoring</span>
            </div>
            <div className="dispatch-stat">
              <span className="stat-value">&lt; 45s</span>
              <span className="stat-title">Average Hotline Answer</span>
            </div>
            <div className="dispatch-stat">
              <span className="stat-value">100%</span>
              <span className="stat-title">GPS Tracked Fleet</span>
            </div>
            <div className="dispatch-stat">
              <span className="stat-value">6 Hubs</span>
              <span className="stat-title">Regional Terminals</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== QUICK CHANNELS GRID ===== */}
      <section className="contact-channels-grid">
        <div className="contact-channel-card">
          <div className="channel-icon-box icon-blue">📞</div>
          <div className="channel-title">24/7 Hotline & Dispatch</div>
          <div className="channel-desc">Immediate telephone assistance for active bus trips, emergency routing, and booking assistance.</div>
          <a href="tel:+251911000111" className="channel-detail">+251 911 000 111</a>
          <span className="channel-sub">Secondary Line: +251 115 500 000</span>
        </div>

        <div className="contact-channel-card">
          <div className="channel-icon-box icon-green">✉️</div>
          <div className="channel-title">Customer Care Inbox</div>
          <div className="channel-desc">Direct email inquiries for booking confirmations, corporate travel accounts, and billing ledgers.</div>
          <a href="mailto:support@translink.com" className="channel-detail">support@translink.com</a>
          <span className="channel-sub">Average response under 15 minutes</span>
        </div>

        <div className="contact-channel-card">
          <div className="channel-icon-box icon-purple">🏢</div>
          <div className="channel-title">Central Operations Hub</div>
          <div className="channel-desc">Our flagship headquarters and main terminal dispatch station in the capital city.</div>
          <div className="channel-detail">Meskel Square, Bole Road</div>
          <span className="channel-sub">Addis Ababa, Ethiopia</span>
        </div>

        <div className="contact-channel-card">
          <div className="channel-icon-box icon-amber">💬</div>
          <div className="channel-title">Instant Messaging</div>
          <div className="channel-desc">Chat directly with an online representative via Telegram or WhatsApp for live passenger queries.</div>
          <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="channel-detail">@TransLinkEthiopia_bot</a>
          <span className="channel-sub">Available 06:00 AM – 11:00 PM</span>
        </div>
      </section>

      {/* ===== MAIN CONTACT SECTION (FORM + STATIONS) ===== */}
      <section className="contact-main-section">
        <div className="contact-layout-grid">
          {/* Left: Contact Form */}
          <div className="contact-form-card">
            <h2 className="form-header-title">Send Us a Direct Message</h2>
            <p className="form-header-sub">
              Fill out this form and our operations dispatch officer will get back to you immediately.
            </p>

            {error && (
              <div className="alert alert-danger rounded-3 py-2 px-3 small mb-3">
                ⚠️ {error}
              </div>
            )}

            {successInquiry ? (
              <div className="inquiry-success-box">
                <div className="success-icon-big">🎉</div>
                <div className="success-title">Message Received Successfully!</div>
                <p className="text-white-50 small mb-3">
                  Thank you for reaching out, <strong>{successInquiry.name}</strong>. Your inquiry has been forwarded to our customer service desk.
                </p>

                <div className="success-detail-card">
                  <div className="small text-muted">Inquiry Reference Number:</div>
                  <div className="fw-bold text-info fs-5 font-monospace">{successInquiry.id}</div>
                  <div className="small text-muted mt-2">Selected Category:</div>
                  <div className="text-white small">{successInquiry.subject}</div>
                </div>

                <div className="d-flex gap-2 justify-content-center">
                  <button className="btn btn-outline-info rounded-pill px-4 btn-sm" onClick={copyInquiryId}>
                    {copied ? '✅ Copied Reference' : '📋 Copy Inquiry ID'}
                  </button>
                  <button
                    className="btn btn-primary rounded-pill px-4 btn-sm"
                    onClick={() => {
                      setSuccessInquiry(null);
                      setForm({
                        name: user?.username || '',
                        email: user?.email || '',
                        phone: '',
                        subject: 'Ticket Reservation & Seat Queries',
                        booking_reference: '',
                        message: ''
                      });
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6 glass-field-group">
                    <label className="glass-field-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="glass-input"
                      placeholder="e.g. Abebe Bekele"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 glass-field-group">
                    <label className="glass-field-label">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      className="glass-input"
                      placeholder="e.g. passenger@gmail.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6 glass-field-group">
                    <label className="glass-field-label">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      name="phone"
                      className="glass-input"
                      placeholder="e.g. +251 911 234 567"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6 glass-field-group">
                    <label className="glass-field-label">Booking Reference (If applicable)</label>
                    <input
                      type="text"
                      name="booking_reference"
                      className="glass-input"
                      placeholder="e.g. TRIP-88201"
                      value={form.booking_reference}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="glass-field-group">
                  <label className="glass-field-label">Inquiry Subject / Category *</label>
                  <select
                    name="subject"
                    className="glass-input"
                    value={form.subject}
                    onChange={handleChange}
                  >
                    <option value="Ticket Reservation & Seat Queries">🎫 Ticket Reservation & Seat Queries</option>
                    <option value="Schedule Delays & Trip Times">🕒 Schedule Delays & Trip Times</option>
                    <option value="Lost & Found Luggage Assistance">🧳 Lost & Found Luggage Assistance</option>
                    <option value="Payment, Telebirr & Refund Inquiries">💳 Payment, Telebirr & Refund Inquiries</option>
                    <option value="Private Bus Charter & Corporate Hire">🚍 Private Bus Charter & Corporate Hire</option>
                    <option value="General Feedback & Suggestions">💬 General Feedback & Suggestions</option>
                  </select>
                </div>

                <div className="glass-field-group">
                  <label className="glass-field-label">Your Message *</label>
                  <textarea
                    name="message"
                    rows="4"
                    className="glass-input"
                    placeholder="Describe your inquiry, requested trip details, or issue..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-submit-message" disabled={submitting}>
                  {submitting ? '📤 Delivering Message...' : '🚀 Submit Message to Dispatch'}
                </button>
              </form>
            )}
          </div>

          {/* Right: Regional Stations Directory */}
          <div className="stations-card">
            <h3 className="stations-title">Regional Terminals & Stations</h3>
            <p className="stations-sub">
              Visit our ticket offices or departure terminals in any major city across the transit network:
            </p>

            <div className="stations-list">
              {REGIONAL_STATIONS.map((station, idx) => (
                <div key={idx} className="station-item">
                  <span className="station-pin">📍</span>
                  <div>
                    <div className="station-name">{station.city}</div>
                    <div className="station-address">{station.address}</div>
                    <div className="station-hours">🕒 {station.hours} • 📞 {station.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section className="contact-faq-section">
        <div className="faq-header">
          <div className="contact-pill-badge">Knowledge Base</div>
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="faq-grid">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="faq-card">
              <div className="faq-q"><span>❓</span> {faq.q}</div>
              <p className="faq-a">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== GLOBAL FOOTER ===== */}
      <footer className="translink-footer">
        <div className="footer-content">
          <div className="footer-col-brand">
            <div className="d-flex align-items-center gap-2 mb-2">
              <img src={logo} alt="Logo" style={{ width: 34, height: 34, borderRadius: 8 }} />
              <h3 className="mb-0">Trans<span>Link</span></h3>
            </div>
            <p>
              Ethiopia's premier intercity bus transportation network. Safe, reliable, and real-time monitored luxury travel connecting all regional centers.
            </p>
          </div>

          <div>
            <div className="footer-col-title">Navigation</div>
            <ul className="footer-links-list">
              <li><Link to="/">🏠 Home</Link></li>
              <li><Link to="/routes">🗺️ Travel Routes</Link></li>
              <li><Link to="/schedules">🕒 Bus Schedules</Link></li>
              <li><Link to="/tracking">📍 Live GPS Tracking</Link></li>
              <li><Link to="/contact">📞 Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Passenger Portal</div>
            <ul className="footer-links-list">
              <li><Link to="/login">🔐 Sign In</Link></li>
              <li><Link to="/register">📝 Register Account</Link></li>
              <li><Link to="/bookings">🎫 My Bookings & Seats</Link></li>
              <li><Link to="/settings">⚙️ Account Settings</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Support & Hotline</div>
            <ul className="footer-links-list">
              <li><a href="tel:+251911000111">📞 +251 911 000 111</a></li>
              <li><a href="mailto:support@translink.com">✉️ support@translink.com</a></li>
              <li><span className="text-white-50">📍 Meskel Sq., Addis Ababa</span></li>
              <li><span className="text-success small fw-semibold">● Live Telemetry Operational</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2026 TransLink Transportation System. All rights reserved.</div>
          <div className="d-flex gap-3">
            <Link to="/">Privacy Policy</Link>
            <Link to="/">Terms of Carriage</Link>
            <Link to="/contact">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;
