# 🚌 TransLink — Bus Transportation Management System

TransLink is a complete full-stack **Bus Transportation Management & Seat Reservation System** designed using HTML5, CSS3, Vanilla JavaScript, Python Flask, and MySQL.

---

## 🚀 Key Features

- **Role-Based Authentication**: Custom permissions for **Admin**, **Driver**, and **Passenger**.
- **Bus Fleet CRUD**: Manage vehicle registration, seating capacities, and fleet statuses (`Available`, `Assigned`, `Maintenance`, `Inactive`).
- **Transit Route Management**: Define intercity origin/destinations, calculated distances, duration, and ticket fares.
- **Conflict-Free Schedules**: Smart dispatch system preventing bus or driver double-booking over overlapping transit windows.
- **Interactive Visual Seat Selector**: 40-seat coach map displaying available, booked, and selected seats.
- **Payment Ledger & Receipts**: Support for Cash, Mobile Payment, Bank Wire, and Credit Card payments with transaction references.
- **Executive Analytics**: KPI summary cards, route yield reports, fleet utilization, and CSV export.
- **Dual-Mode API & Fallback Client**: Communicates directly with Flask REST endpoints, with seamless client-side reactive store fallback when offline.

---

## 🛠️ Technology Stack

- **Frontend**: Plain HTML5, Modern CSS3 (CSS Variables, Glassmorphism, Responsive), Vanilla JavaScript (Fetch API, ES6 Modules).
- **Backend**: Python 3.x, Flask, Flask-CORS, Werkzeug.
- **Database**: MySQL 8.x (`mysql-connector-python`).
- **Environment**: VS Code / Antigravity on Windows.

---

## 📂 Project Structure

```text
bus-transportation-system/
│
├── frontend/
│   ├── index.html              # Landing page & quick trip search
│   ├── login.html              # Authentication & 1-click demo logins
│   ├── register.html           # Passenger registration
│   ├── dashboard.html          # Executive transport dashboard
│   │
│   ├── pages/
│   │   ├── buses.html          # Bus fleet CRUD
│   │   ├── routes.html         # Route CRUD
│   │   ├── schedules.html      # Schedule dispatching & conflict checking
│   │   ├── drivers.html        # Driver directory
│   │   ├── passengers.html     # Passenger accounts & history
│   │   ├── bookings.html       # Visual seat picker & reservations
│   │   ├── payments.html       # Financial ledger & receipt modal
│   │   └── reports.html        # Analytics & CSV export
│   │
│   ├── css/
│   │   ├── style.css           # Core design tokens & typography
│   │   ├── navbar.css          # Top navigation & role switcher
│   │   ├── sidebar.css         # Collapsible sidebar
│   │   ├── dashboard.css       # KPI cards & activity widgets
│   │   ├── forms.css           # Form controls & coach seat map styles
│   │   ├── tables.css          # Data tables & pagination
│   │   └── responsive.css      # Desktop, tablet, mobile media queries
│   │
│   └── js/
│       ├── main.js             # Universal REST client & toast system
│       ├── auth.js             # Login / Register / Logout handlers
│       ├── buses.js            # Fleet CRUD operations
│       ├── routes.js           # Route CRUD operations
│       ├── schedules.js        # Schedule conflict checker & dispatch
│       ├── drivers.js          # Driver records & licensing validation
│       ├── passengers.js       # Passenger directory & status toggles
│       ├── bookings.js         # Interactive seat map & booking engine
│       ├── payments.js         # Payment ledger & receipt modal
│       └── reports.js          # Analytics calculations & CSV export
│
├── backend/
│   ├── app.py                  # Flask Application Factory & Blueprints
│   ├── config.py               # Environment configuration
│   ├── requirements.txt        # Python dependency manifest
│   │
│   ├── routes/                 # Blueprint REST API Controllers
│   │   ├── auth_routes.py
│   │   ├── bus_routes.py
│   │   ├── route_routes.py
│   │   ├── schedule_routes.py
│   │   ├── driver_routes.py
│   │   ├── passenger_routes.py
│   │   ├── booking_routes.py
│   │   ├── payment_routes.py
│   │   └── report_routes.py
│   │
│   ├── models/                 # Database Query Models
│   │   ├── user.py
│   │   ├── bus.py
│   │   ├── route.py
│   │   ├── schedule.py
│   │   ├── driver.py
│   │   ├── passenger.py
│   │   ├── booking.py
│   │   └── payment.py
│   │
│   ├── services/               # Business Logic Layer
│   │   ├── auth_service.py
│   │   ├── bus_service.py
│   │   ├── route_service.py
│   │   ├── schedule_service.py
│   │   ├── booking_service.py
│   │   └── payment_service.py
│   │
│   ├── database/
│   │   ├── connection.py       # MySQL connection pool
│   │   ├── schema.sql          # Database DDL
│   │   └── seed.sql            # Initial sample seed data
│   │
│   └── utils/
│       ├── validators.py       # Input validation rules
│       └── helpers.py          # Response formatters
│
├── database/
│   ├── bus_transportation.sql  # Full MySQL database dump
│   └── schema.sql              # Schema file
│
├── tests/
│   ├── test_auth.py
│   ├── test_buses.py
│   ├── test_routes.py
│   ├── test_bookings.py
│   └── test_payments.py
│
├── .env                        # Environment variables
├── .gitignore
├── README.md                   # System documentation
└── run.py                      # Execution entry point
```

---

## ⚙️ Installation & Setup Instructions

### 1. Requirements
- MySQL Server 8.0+
- Python 3.8+
- Modern Web Browser (Chrome, Edge, Firefox)

### 2. Database Creation & Seeding
Execute the SQL script in MySQL Workbench or via MySQL Command Line:

```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < database/bus_transportation.sql
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p bus_transportation < backend/database/seed.sql
```

### 3. Environment Variables
Configure `.env` in the root folder:

```ini
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bus_transportation
DB_USER=root
DB_PASSWORD=your_password
SECRET_KEY=translink_secret_key_2026
PORT=5000
```

### 4. Installing Dependencies & Running Backend

```bash
# Create and activate Python virtual environment
python -m venv venv
venv\Scripts\activate

# Install requirements
pip install -r backend/requirements.txt

# Run Flask REST Server
python run.py
```

The server will start at `http://127.0.0.1:5000`.

---

## 🔑 Default Test Credentials

| Role | Username / Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` or `admin@translink.com` | `admin123` | Full system control, fleet management, schedule creation, reporting |
| **Driver** | `driver_john` | `driver123` | View assigned trips, passengers, and schedules |
| **Passenger** | `alice_smith` | `passenger123` | Search trips, select seats, book tickets, view receipts |

*Note: The login page includes 1-Click Demo Buttons for immediate testing.*

---

## 📡 REST API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & return session info |
| `POST` | `/api/auth/register` | Register new passenger |
| `GET`, `POST` | `/api/buses` | Fetch fleet / Create new bus |
| `GET`, `PUT`, `DELETE` | `/api/buses/<id>` | Retrieve, update, or delete bus |
| `GET`, `POST` | `/api/routes` | Fetch routes / Add new route |
| `GET`, `PUT`, `DELETE` | `/api/routes/<id>` | Retrieve, edit, or remove route |
| `GET`, `POST` | `/api/schedules` | List schedules / Dispatch new schedule |
| `GET`, `PUT`, `DELETE` | `/api/schedules/<id>` | Manage schedule lifecycle & conflict checking |
| `GET`, `POST` | `/api/drivers` | Driver directory CRUD |
| `GET`, `PUT` | `/api/passengers` | List passengers & toggle account status |
| `GET`, `POST` | `/api/bookings` | Book ticket & select coach seat |
| `PUT`, `DELETE` | `/api/bookings/<id>` | Cancel booking & release seat |
| `GET`, `POST` | `/api/payments` | Payment ledger & transaction details |
| `GET` | `/api/reports/stats` | Executive KPI analytics |

---

## 🧪 Running Unit Tests

```bash
pytest tests/
```
