# ⚙️ TransLink Backend REST API

High-performance, secure Python Flask REST API server powering the **TransLink Bus Transportation Management System**.

---

## 🌟 Architecture & Features

- **Application Factory Pattern**: Clean modular architecture powered by Flask Blueprints for each domain.
- **Service-Repository Design**: Clean separation of concerns across `routes/` (Controllers), `services/` (Business logic), and `models/` (Data persistence).
- **Database Engine**: Native **PostgreSQL 18** integration with automatic database creation, schema creation, and seeding on boot (`bus_transportation`).
- **Robust Security**:
  - **JWT Authentication**: Cryptographically signed JSON Web Tokens for stateless authorization.
  - **Password Hashing**: Secure salted password hashes via `werkzeug.security.generate_password_hash`.
  - **Rate Limiting**: Defends against brute-force attacks via `flask-limiter` (e.g. 10/min on `/api/auth/login`).
  - **Security HTTP Headers**: Automatically sets `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, and `Referrer-Policy`.
  - **Strict CORS Policy**: Whitelists only verified origins (localhost, private network IPs) rather than risky wildcards.
- **Schedule Conflict Prevention**: Built-in validation algorithm preventing vehicle or driver double-dispatch across overlapping transit times.
- **Full Automated Test Suite**: Comprehensive unit and integration test coverage using `pytest`.

---

## 📂 Backend Directory Structure

```text
backend/
├── app.py                      # Flask Application Factory, CORS, headers & Blueprints
├── config.py                   # Configuration class and environment variable loader
├── extensions.py               # Shared extensions (Flask-Limiter)
├── requirements.txt            # Python dependencies
│
├── routes/                     # Blueprint REST Controllers
│   ├── auth_routes.py          # /api/auth (login, register, me, change-password)
│   ├── bus_routes.py           # /api/buses (CRUD, status updates)
│   ├── route_routes.py         # /api/routes (origin, destination, fares)
│   ├── schedule_routes.py      # /api/schedules (dispatch, conflict checks)
│   ├── driver_routes.py        # /api/drivers (registry, licensing)
│   ├── passenger_routes.py     # /api/passengers (directory, account status)
│   ├── booking_routes.py       # /api/bookings (seat booking, cancel, seat map)
│   ├── payment_routes.py       # /api/payments (ledger, transaction records)
│   ├── report_routes.py        # /api/reports (analytics, KPI stats, CSV)
│   └── tracking_routes.py      # /api/tracking (simulated/live GPS bus locations)
│
├── services/                   # Business Logic & Rules
│   ├── auth_service.py         # Validation, credential checking, token generation
│   ├── bus_service.py          # Fleet capacity & status management
│   ├── route_service.py        # Transit route computations
│   ├── schedule_service.py     # Overlap checking & smart dispatching
│   ├── booking_service.py      # Seat reservation lock & cancellation logic
│   └── payment_service.py      # Payment ledger & reference generator
│
├── models/                     # Data Query Layer
│   ├── user.py
│   ├── bus.py
│   ├── route.py
│   ├── schedule.py
│   ├── driver.py
│   ├── passenger.py
│   ├── booking.py
│   └── payment.py
│
├── database/                   # Database Utilities & Schemas
│   ├── connection.py           # PostgreSQL connection manager & auto-seed runner
│   ├── schema_postgres.sql     # PostgreSQL 18 relational schema
│   └── seed.sql                # Starter sample dataset
│
└── utils/                      # Helper Functions & Validators
    ├── security.py             # JWT token generation & token required decorators
    ├── validators.py           # Sanitization and field validation
    └── helpers.py              # Standardized JSON response formatters
```

---

## 🚀 Setup & Execution

### 1. Prerequisites
- Python 3.8 or higher installed on your system.

### 2. Virtual Environment Setup

From the repository root:

```bash
# Windows (PowerShell / Command Prompt)
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r backend/requirements.txt
```

### 4. Configuration (`.env`)

Create or update the `.env` file in the project root:

```ini
# Flask Environment
FLASK_ENV=development
SECRET_KEY=translink_super_secret_jwt_key_2026

# PostgreSQL Connection Settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bus_transportation
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# Security Settings
JWT_EXPIRY_HOURS=24
RATE_LIMIT_DEFAULT=100 per hour
RATE_LIMIT_AUTH=10 per minute
```

### 5. Start the Server

```bash
python run.py
```

The server initializes the database automatically and starts listening at:
- **Local Address**: `http://127.0.0.1:5000`
- **API Base URL**: `http://127.0.0.1:5000/api`

---

## 📡 REST API Reference

All successful responses return a JSON envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | None | Log in with username/email & password |
| `POST` | `/api/auth/register` | None | Register a new passenger account |
| `GET` | `/api/auth/me` | Bearer Token | Return currently logged-in user profile |
| `POST` | `/api/auth/change-password` | Bearer Token | Update authenticated user's password |

### 2. Buses (`/api/buses`)
| Method | Endpoint | Roles Allowed | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/buses` | All / Public | Retrieve list of all buses in fleet |
| `GET` | `/api/buses/<id>` | All / Public | Get single bus details |
| `POST` | `/api/buses` | Admin | Register new bus into fleet |
| `PUT` | `/api/buses/<id>` | Admin | Update bus details or maintenance status |
| `DELETE` | `/api/buses/<id>` | Admin | Remove bus from fleet |

### 3. Routes (`/api/routes`)
| Method | Endpoint | Roles Allowed | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/routes` | All / Public | List all active intercity transit routes |
| `GET` | `/api/routes/<id>` | All / Public | Get single route details |
| `POST` | `/api/routes` | Admin | Create route with distance & fare |
| `PUT` | `/api/routes/<id>` | Admin | Update route fare or duration |
| `DELETE` | `/api/routes/<id>` | Admin | Delete route |

### 4. Schedules (`/api/schedules`)
| Method | Endpoint | Roles Allowed | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/schedules` | All / Public | Retrieve active schedules |
| `POST` | `/api/schedules` | Admin | Dispatch schedule with conflict check |
| `PUT` | `/api/schedules/<id>` | Admin | Update schedule timing |
| `DELETE` | `/api/schedules/<id>` | Admin | Cancel schedule |

### 5. Bookings & Seats (`/api/bookings`)
| Method | Endpoint | Roles Allowed | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bookings` | Admin, Passenger | Fetch user or system bookings |
| `GET` | `/api/bookings/seats/<schedule_id>` | All | Get booked & available seats for trip |
| `POST` | `/api/bookings` | Admin, Passenger | Reserve seat & generate ticket |
| `PUT` | `/api/bookings/<id>/cancel` | Admin, Passenger | Cancel booking and release seat |

### 6. Drivers & Passengers (`/api/drivers`, `/api/passengers`)
| Method | Endpoint | Roles Allowed | Description |
| :--- | :--- | :--- | :--- |
| `GET`, `POST` | `/api/drivers` | Admin | Manage driver accounts & licenses |
| `GET`, `PUT` | `/api/passengers` | Admin | Manage passenger directory & statuses |

### 7. Payments & Reports (`/api/payments`, `/api/reports`, `/api/tracking`)
| Method | Endpoint | Roles Allowed | Description |
| :--- | :--- | :--- | :--- |
| `GET`, `POST` | `/api/payments` | Admin, Passenger | Record & view payment transactions |
| `GET` | `/api/reports/stats` | Admin | Retrieve executive KPI analytics |
| `GET` | `/api/reports/export-csv` | Admin | Download system metrics as CSV |
| `GET` | `/api/tracking/live` | All | Fetch live GPS coordinates for buses |

---

## 🧪 Testing

The backend includes a comprehensive suite of unit and integration tests under `tests/`.

Run all tests with:

```bash
pytest tests/ -v
```
