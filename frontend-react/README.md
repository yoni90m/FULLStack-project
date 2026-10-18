# 🚌 TransLink React Frontend (SPA)

Modern, responsive Single Page Application (SPA) for the **TransLink Bus Transportation Management & Seat Reservation System**, built with **React 19**, **Vite**, **React Router v7**, and **Leaflet**.

---

## 🌟 Key Highlights

- ⚡ **Lightning-Fast Vite Build**: Built on Vite with hot-module replacement (HMR) and fast development server.
- 🎨 **Modern Responsive UI**: Styled with modern CSS variables, glassmorphic accents, and React-Bootstrap components.
- 🔐 **Role-Based Protected Routing**: Strict authorization guards for **Admin**, **Driver**, and **Passenger** roles, with fallback redirect to Access Denied.
- 🗺️ **Live GPS Bus Fleet Tracking**: Real-time interactive vehicle map powered by **Leaflet** & OpenStreetMap.
- 💺 **Interactive Seat Picker**: Visual 40-passenger coach seat matrix with instant seat reservation status (Available, Booked, Selected).
- 📊 **Executive Analytics**: KPI metric cards, route yield graphs, and instant CSV data export.
- 🧾 **Payment Receipts & Ledger**: Multi-method transaction ledger (Cash, Mobile, Card, Wire) with downloadable receipt previews.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Component-driven UI library |
| **Vite 8** | Next-generation frontend build tool and dev server |
| **React Router v7** | Client-side declarative routing and protected route guards |
| **React-Bootstrap & Bootstrap 5** | Responsive layout grid, modals, forms, and UI widgets |
| **Leaflet 1.9** | Interactive live GPS tracking map |
| **Fetch API** | Direct REST communication with the Flask backend API |

---

## 📂 Directory Structure

```text
frontend-react/
├── public/                 # Static public assets & favicons
├── src/
│   ├── assets/             # Brand logos, icons, and media
│   ├── components/         # Reusable UI components (Navbar, Sidebar, Footer, Modals)
│   ├── contexts/           # Authentication and global state providers
│   ├── pages/              # Application page views
│   │   ├── Landing.jsx         # Public landing page & quick trip search
│   │   ├── LoginPage.jsx       # Login page with 1-click demo logins
│   │   ├── RegisterPage.jsx    # Passenger account registration
│   │   ├── Dashboard.jsx       # Role-specific executive transport dashboard
│   │   ├── BusesPage.jsx       # Fleet CRUD (capacities, status, plate numbers)
│   │   ├── RoutesPage.jsx      # Transit route management & fare configuration
│   │   ├── SchedulesPage.jsx   # Schedule dispatching & conflict validation
│   │   ├── DriversPage.jsx     # Driver registry & license verification
│   │   ├── PassengersPage.jsx  # Passenger directory & booking records
│   │   ├── BookingsPage.jsx    # Visual seat reservation & booking lifecycle
│   │   ├── PaymentsPage.jsx    # Payment transaction ledger & receipts
│   │   ├── ReportsPage.jsx     # KPI analytics, charts, and CSV report exports
│   │   ├── LiveTrackingPage.jsx# Interactive Leaflet live GPS bus tracking
│   │   ├── SettingsPage.jsx    # User settings and profile updates
│   │   ├── AccessDeniedPage.jsx# 403 Forbidden handler
│   │   └── NotFoundPage.jsx    # 404 Not Found handler
│   ├── App.jsx             # Route definitions & top-level layout
│   ├── index.css           # Global theme variables, typography, and utility classes
│   └── main.jsx            # React root DOM hydration
├── index.html              # HTML entry point
├── package.json            # Node.js dependencies and scripts
└── vite.config.js          # Vite configuration & backend proxy
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **TransLink Backend API**: Running on `http://127.0.0.1:5000`

### 1. Installation

Navigate into the `frontend-react` folder and install dependencies:

```bash
cd frontend-react
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

The application will start at:
👉 **`http://localhost:5173`** (or the port specified by Vite in console).

### 3. Build for Production

To create an optimized production build:

```bash
npm run build
```

The output bundle will be generated in `frontend-react/dist/`. 
> 💡 *Note*: When `frontend-react/dist/` is present, the Flask backend at `run.py` can automatically serve this production bundle directly at `http://127.0.0.1:5000/`.

### 4. Preview the Production Build

```bash
npm run preview
```

---

## 🔗 Backend API Integration

The React app interacts directly with the Flask REST API at `http://127.0.0.1:5000/api`.

All requests carrying user authentication send the JSON Web Token (JWT) in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

### API Proxy in `vite.config.js`
In development mode, requests to `/api` can be transparently forwarded to the Flask server via Vite's built-in dev proxy:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:5000',
      changeOrigin: true
    }
  }
}
```

---

## 🔑 Demo Login Accounts

| Role | Username / Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` / `admin@translink.com` | `admin123` | Full system control: Fleet, Routes, Schedules, Drivers, Analytics, Settings |
| **Driver** | `driver_john` / `john.doe@translink.com` | `driver123` | View assigned schedules, routes, trip manifests, and passenger lists |
| **Passenger** | `alice_smith` / `alice.smith@gmail.com` | `passenger123` | Search trips, select coach seats, book tickets, and download receipts |

*(Demo login buttons are available directly on the Login screen for instant testing).*

---

## 📜 Available Scripts

- `npm run dev`: Starts the local development server with Hot Module Replacement (HMR).
- `npm run build`: Compiles and bundles production-ready assets into the `dist/` directory.
- `npm run preview`: Locally previews the production build.
- `npm run lint`: Runs Oxlint to check code quality and detect lint errors.
