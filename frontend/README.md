# 🌐 TransLink Vanilla Frontend

The lightweight, zero-dependency HTML5, Modern CSS3, and Vanilla JavaScript client for the **TransLink Bus Transportation Management System**.

---

## 🌟 Highlights

- ⚡ **Zero-Build Dependency**: Runs natively in any modern web browser without needing `npm`, webpack, or compilers.
- 🎨 **Modern Design System**: Built with modern CSS variables, smooth gradients, responsive flexbox/grid layouts, and glassmorphic elements.
- 🔄 **Dual-Mode API & Offline Fallback**:
  - Connects seamlessly to the Python Flask backend at `http://127.0.0.1:5000/api`.
  - Intelligently falls back to an offline reactive client-side store when backend is unreachable, ensuring uninterrupted UI testing.
- 💺 **Interactive 40-Seat Coach Selector**: Dynamic seat grid allowing passengers to choose seats visually.
- 📊 **Executive Analytics**: KPI summary widgets, fleet yield charts, and client-side CSV export.

---

## 📂 Directory Structure

```text
frontend/
├── index.html                  # Public landing page & instant schedule search
├── login.html                  # Role switcher & 1-click test login buttons
├── register.html               # Passenger sign-up & immediate seat reservation
├── dashboard.html              # Central role-based management dashboard
│
├── pages/                      # Specific feature views
│   ├── buses.html              # Fleet CRUD operations & capacity viewer
│   ├── routes.html             # Route management with distance & fare controls
│   ├── schedules.html          # Conflict-free schedule dispatching
│   ├── drivers.html            # Driver registry & license verification
│   ├── passengers.html         # Passenger records & account status toggles
│   ├── bookings.html           # Visual seat reservation & booking flow
│   ├── payments.html           # Financial ledger, transactions & receipts
│   └── reports.html            # Analytics, performance KPIs & CSV export
│
├── css/                        # Modular CSS stylesheets
│   ├── style.css               # Global tokens, color palettes, and resets
│   ├── navbar.css              # Top navigation bar & user profile dropdown
│   ├── sidebar.css             # Collapsible sidebar for management views
│   ├── dashboard.css           # KPI cards, grid widgets, and metrics
│   ├── forms.css               # Form controls & visual coach seat map styles
│   ├── tables.css              # Data tables, action badges, and pagination
│   └── responsive.css          # Responsive media queries (Mobile, Tablet, Desktop)
│
├── js/                         # Vanilla ES6 JavaScript modules
│   ├── main.js                 # Universal REST client, state & toast alerts
│   ├── auth.js                 # Authentication, JWT session handling, & demo logins
│   ├── buses.js                # Bus fleet management logic
│   ├── routes.js               # Route creation and edit handlers
│   ├── schedules.js            # Dispatch validation & schedule operations
│   ├── drivers.js              # Driver operations & contact validation
│   ├── passengers.js           # Passenger directory controls
│   ├── bookings.js             # Interactive seat map & booking engine
│   ├── payments.js             # Payment records & printable receipt modals
│   └── reports.js              # KPI calculations & CSV table exporter
│
└── assets/                     # Images, icons, and visual assets
```

---

## 🚀 Running the Vanilla Frontend

### Option 1: Served by Flask (Recommended)
When you run `python run.py`, Flask automatically serves this frontend at:
👉 **`http://127.0.0.1:5000/`** (unless a production React build exists in `frontend-react/dist`).

### Option 2: Live Server (VS Code Extension)
Right-click on `frontend/index.html` in VS Code and select **"Open with Live Server"**.

### Option 3: Python Built-in HTTP Server
```bash
cd frontend
python -m http.server 8080
```
Open your browser at `http://127.0.0.1:8080`.
