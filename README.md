# 🚌 TransLink — Bus Transportation Management System

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.3-000000?style=flat&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**TransLink** is an enterprise-grade, full-stack **Bus Transportation Management & Seat Reservation System**. It features a modern **React 19 SPA**, an alternative zero-dependency **Vanilla HTML5/JS client**, and a high-performance **Python Flask REST API** backed by **PostgreSQL 18**.

---

## 🚀 Key Highlights & Features

- 🔐 **Role-Based Authentication**: Strict, granular access control for **Admin**, **Driver**, and **Passenger** roles via JWT tokens.
- ⚛️ **Dual Frontend Experience**:
  - **Modern SPA** (`frontend-react/`): React 19, Vite, React Router v7, React-Bootstrap, and Leaflet GPS maps.
  - **Classic Web Client** (`frontend/`): Pure HTML5/CSS3/Vanilla JS with offline reactive store fallback.
- 🗺️ **Live GPS Bus Tracking**: Real-time vehicle location visualization on interactive OpenStreetMap / Leaflet maps.
- 💺 **Visual Coach Seat Matrix**: 40-seat visual seat selector with immediate reservation status (`Available`, `Booked`, `Selected`).
- 🚍 **Fleet & Driver CRUD**: Vehicle capacity tracking, registration plates, maintenance statuses, and driver license checks.
- 🛣️ **Transit Routes & Scheduling**: Intercity route definitions, duration/fare calculations, and smart conflict-free dispatching to prevent double-booking.
- 💳 **Payment Ledger & Receipts**: Multi-channel payments (Cash, Mobile, Card, Wire) with instant downloadable receipt generation.
- 📈 **Executive Analytics & Reporting**: Key KPI metrics, route yield analysis, fleet utilization rates, and one-click CSV export.
- 🛡️ **Hardened Backend Security**: Flask-Limiter brute-force protection, salted Werkzeug password hashing, security HTTP headers (`DENY`, `nosniff`), and strict CORS rules.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend (React)** | React 19, Vite 8, React Router v7, React-Bootstrap 2, Leaflet 1.9, CSS3 |
| **Frontend (Vanilla)** | Plain HTML5, Modern CSS3 (Variables, Glassmorphism), Vanilla ES6 JavaScript |
| **Backend API** | Python 3.8+, Flask 3.0, Flask-CORS, Flask-Limiter, PyJWT, Werkzeug |
| **Database** | PostgreSQL 18 (Auto-initialized and seeded on first run) |
| **Testing** | Pytest 8.2 |

---

## 📂 Project Structure

```text
busTransporation/
├── backend/                    # Python Flask REST API
│   ├── app.py                  # Application factory, middleware & blueprint registration
│   ├── config.py               # Application configuration and environment variables
│   ├── extensions.py           # Shared extensions (Flask-Limiter)
│   ├── requirements.txt        # Backend Python dependencies
│   ├── database/               # Database connection manager, schema, and seed data
│   ├── models/                 # Relational query models (User, Bus, Route, Booking, etc.)
│   ├── routes/                 # REST API Blueprints (Auth, Buses, Routes, Schedules, etc.)
│   ├── services/               # Core business logic and validation rules
│   ├── utils/                  # Security helpers, JWT handlers, and formatters
│   └── README.md               # Dedicated Backend API Documentation
│
├── frontend-react/             # Modern React 19 SPA (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI widgets, navigation bars, and modals
│   │   ├── pages/              # Views (Landing, Dashboard, Tracking, Bookings, etc.)
│   │   ├── contexts/           # Authentication state context
│   │   ├── App.jsx             # Route definitions & guards
│   │   └── main.jsx            # Application hydration
│   ├── package.json            # Node scripts and dependencies
│   ├── vite.config.js          # Vite config & API reverse proxy
│   └── README.md               # Dedicated React Frontend Documentation
│
├── frontend/                   # Vanilla HTML5/CSS3/JavaScript Client
│   ├── index.html              # Public landing page
│   ├── pages/                  # HTML feature templates (buses, routes, bookings, etc.)
│   ├── css/                    # Modular stylesheet tokens, themes, and layouts
│   ├── js/                     # ES6 client logic and offline reactive store
│   └── README.md               # Dedicated Vanilla Frontend Documentation
│
├── database/                   # Database schemas and SQL dumps
│   ├── schema_postgres.sql     # PostgreSQL 18 full schema and seed script
│   └── schema.sql              # Relational DDL definitions
│
├── tests/                      # Automated test suite (Pytest)
│   ├── test_auth.py
│   ├── test_buses.py
│   ├── test_routes.py
│   ├── test_schedules.py
│   ├── test_bookings.py
│   ├── test_payments.py
│   └── conftest.py
│
├── .env                        # Environment configuration
├── run.py                      # Server launcher script
└── README.md                   # System documentation (This file)
```

---

## ⚡ Quick Start Guide

### Step 1: Clone & Configure Environment

```bash
git clone https://github.com/yoni90m/FULLStack-project.git
cd FULLStack-project
```

A sample `.env` is already configured in the root directory:
```ini
FLASK_ENV=development
SECRET_KEY=translink_secret_key_2026
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bus_transportation
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_EXPIRY_HOURS=24
RATE_LIMIT_DEFAULT=100 per hour
RATE_LIMIT_AUTH=10 per minute
```

---

### Step 2: Start the Backend REST API

1. **Create and activate a Python virtual environment**:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Run the server**:
   ```bash
   python run.py
   ```

> 💡 **Automatic Setup**: On initial startup, the backend automatically connects to PostgreSQL, creates the `bus_transportation` database if needed, generates all tables, and seeds initial routes, buses, drivers, and default user accounts!
> 
> - **API Base URL**: `http://127.0.0.1:5000/api`
> - **Web Access**: `http://127.0.0.1:5000`

---

### Step 3: Run the Frontend

You can choose either the **Modern React SPA** or the **Vanilla Client**:

#### Option A: Run the Modern React SPA (Recommended)

1. Open a new terminal window:
   ```bash
   cd frontend-react
   npm install
   npm run dev
   ```
2. Open your browser at:
   👉 **`http://localhost:5173`**

#### Option B: Use the Vanilla Web Client

- Open `http://127.0.0.1:5000` directly in your browser while `python run.py` is running, or
- Right-click `frontend/index.html` in VS Code and select **Open with Live Server**.

---

## 🔑 Default Credentials

The system comes pre-seeded with sample accounts for each role:

| Role | Username / Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` or `admin@translink.com` | `admin123` | Full control: fleet management, route creation, scheduling, analytics |
| **Driver** | `driver_john` | `driver123` | Assigned trips, trip passenger manifests, route navigation |
| **Passenger** | `alice_smith` | `passenger123` | Search trips, select coach seats, book tickets, download receipts |

*(1-Click Demo Login buttons are also available on the login page).*

---

## 📡 REST API Overview

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT token |
| `POST` | `/api/auth/register` | Public | Register new passenger account |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session profile |
| `GET`, `POST` | `/api/buses` | Public / Admin | Fetch bus fleet or add new vehicle |
| `GET`, `PUT`, `DELETE` | `/api/buses/<id>` | Public / Admin | Read, modify, or remove vehicle |
| `GET`, `POST` | `/api/routes` | Public / Admin | List routes or create new transit route |
| `GET`, `PUT`, `DELETE` | `/api/routes/<id>` | Public / Admin | Manage individual route parameters |
| `GET`, `POST` | `/api/schedules` | Public / Admin | Fetch schedules or dispatch with conflict check |
| `GET`, `PUT`, `DELETE` | `/api/schedules/<id>` | Public / Admin | Update or cancel scheduled trips |
| `GET`, `POST` | `/api/drivers` | Admin | Driver roster & license compliance |
| `GET`, `PUT` | `/api/passengers` | Admin | Manage passenger directory & statuses |
| `GET`, `POST` | `/api/bookings` | Admin / Passenger | View bookings or reserve coach seat |
| `GET` | `/api/bookings/seats/<id>` | Public | Retrieve occupied/available seat matrix |
| `PUT` | `/api/bookings/<id>/cancel`| Admin / Passenger | Cancel ticket and release seat |
| `GET`, `POST` | `/api/payments` | Admin / Passenger | View payment ledger & process transactions |
| `GET` | `/api/reports/stats` | Admin | Executive KPI metrics and yields |
| `GET` | `/api/reports/export-csv` | Admin | Download report data in CSV format |
| `GET` | `/api/tracking/live` | Public | Live GPS bus coordinates for Leaflet map |

---

## 🧪 Running Automated Tests

Run the full automated test suite using `pytest`:

```bash
# Activate virtual environment first
.\venv\Scripts\activate

# Run tests
pytest tests/ -v
```

---

## 📚 Sub-Module Documentation

For detailed information on individual modules, refer to:
- 📖 [Backend Documentation](backend/README.md)
- 📖 [React Frontend Documentation](frontend-react/README.md)
- 📖 [Vanilla Frontend Documentation](frontend/README.md)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
