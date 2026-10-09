"""
Pure SQLite3 Database Connection & Query Execution Manager.
Provides thread-safe connections, automatic schema initialization, and foreign key enforcement.
"""

import os
import sqlite3
import datetime
from pathlib import Path
from backend.config import Config

_sqlite_initialized = False

def _get_sqlite_path():
    """Retrieve absolute path to the SQLite3 database file."""
    if hasattr(Config, 'DB_SQLITE_PATH') and Config.DB_SQLITE_PATH:
        p = Path(Config.DB_SQLITE_PATH)
        if p.is_absolute():
            return str(p)
        root = Path(__file__).resolve().parent.parent.parent
        return str(root / p)
    root = Path(__file__).resolve().parent.parent.parent
    return str(root / 'database' / 'bus_transportation.sqlite3')

def _init_sqlite_db(db_path):
    """Create SQLite tables and seed data if database is new or empty."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Check if users table already exists
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    if cur.fetchone():
        conn.close()
        return

    # Enable foreign keys
    cur.execute("PRAGMA foreign_keys = ON;")

    # Create Schema
    cur.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'Passenger',
        status TEXT NOT NULL DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS buses (
        bus_id INTEGER PRIMARY KEY AUTOINCREMENT,
        bus_number TEXT NOT NULL UNIQUE,
        plate_number TEXT NOT NULL UNIQUE,
        model TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Available',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS drivers (
        driver_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        license_number TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS routes (
        route_id INTEGER PRIMARY KEY AUTOINCREMENT,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        distance REAL NOT NULL,
        estimated_duration TEXT NOT NULL,
        fare REAL NOT NULL DEFAULT 25.00,
        status TEXT NOT NULL DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedules (
        schedule_id INTEGER PRIMARY KEY AUTOINCREMENT,
        bus_id INTEGER NOT NULL,
        route_id INTEGER NOT NULL,
        driver_id INTEGER NOT NULL,
        departure_time TEXT NOT NULL,
        arrival_time TEXT NOT NULL,
        available_seats INTEGER NOT NULL,
        fare REAL NOT NULL DEFAULT 25.00,
        status TEXT NOT NULL DEFAULT 'Scheduled',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bus_id) REFERENCES buses (bus_id) ON DELETE CASCADE,
        FOREIGN KEY (route_id) REFERENCES routes (route_id) ON DELETE CASCADE,
        FOREIGN KEY (driver_id) REFERENCES drivers (driver_id) ON DELETE RESTRICT
    );

    CREATE TABLE IF NOT EXISTS passengers (
        passenger_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
        booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_reference TEXT NOT NULL UNIQUE,
        passenger_id INTEGER NOT NULL,
        schedule_id INTEGER NOT NULL,
        seat_number TEXT NOT NULL,
        booking_date TEXT DEFAULT CURRENT_TIMESTAMP,
        booking_status TEXT NOT NULL DEFAULT 'Confirmed',
        FOREIGN KEY (passenger_id) REFERENCES passengers (passenger_id) ON DELETE CASCADE,
        FOREIGN KEY (schedule_id) REFERENCES schedules (schedule_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'Completed',
        payment_date TEXT DEFAULT CURRENT_TIMESTAMP,
        transaction_reference TEXT NOT NULL UNIQUE,
        FOREIGN KEY (booking_id) REFERENCES bookings (booking_id) ON DELETE CASCADE
    );
    """)

    # Seed Default Data
    from werkzeug.security import generate_password_hash
    now = datetime.datetime.now()
    admin_hash = generate_password_hash('admin123')
    driver_hash = generate_password_hash('driver123')
    passenger_hash = generate_password_hash('passenger123')

    cur.executemany("""
    INSERT INTO users (user_id, username, email, password, role, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, [
        (1, 'admin', 'admin@translink.com', admin_hash, 'Admin', 'Active', now.strftime('%Y-%m-%d %H:%M:%S')),
        (2, 'driver_john', 'john.doe@translink.com', driver_hash, 'Driver', 'Active', now.strftime('%Y-%m-%d %H:%M:%S')),
        (3, 'driver_sarah', 'sarah.connor@translink.com', driver_hash, 'Driver', 'Active', now.strftime('%Y-%m-%d %H:%M:%S')),
        (4, 'driver_michael', 'michael.scott@translink.com', driver_hash, 'Driver', 'Active', now.strftime('%Y-%m-%d %H:%M:%S')),
        (5, 'alice_smith', 'alice.smith@gmail.com', passenger_hash, 'Passenger', 'Active', now.strftime('%Y-%m-%d %H:%M:%S')),
        (6, 'bob_jones', 'bob.jones@yahoo.com', passenger_hash, 'Passenger', 'Active', now.strftime('%Y-%m-%d %H:%M:%S')),
        (7, 'clara_oswald', 'clara.oswald@outlook.com', passenger_hash, 'Passenger', 'Active', now.strftime('%Y-%m-%d %H:%M:%S'))
    ])

    cur.executemany("""
    INSERT INTO buses (bus_id, bus_number, plate_number, model, capacity, status)
    VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, 'BUS-101', 'NY-TR-8801', 'Volvo 9700 Luxury Cruiser', 40, 'Assigned'),
        (2, 'BUS-102', 'MA-TR-4422', 'Mercedes-Benz Tourismo', 36, 'Available'),
        (3, 'BUS-103', 'CA-TR-1290', 'Scania Touring HD', 44, 'Assigned'),
        (4, 'BUS-104', 'IL-TR-9031', 'MCI J4500 Coach', 40, 'Available'),
        (5, 'BUS-105', 'WA-TR-3384', 'Prevost H3-45 Executive', 32, 'Maintenance'),
        (6, 'BUS-106', 'TX-TR-5519', 'Setra ComfortClass S 515', 40, 'Available'),
        (7, 'BUS-107', 'FL-TR-7720', 'Volvo 9900 VIP Sleeper', 28, 'Inactive')
    ])

    cur.executemany("""
    INSERT INTO drivers (driver_id, user_id, name, phone, license_number, status)
    VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, 2, 'John Doe', '+1 (555) 234-5678', 'DL-NY-9023812', 'Active'),
        (2, 3, 'Sarah Connor', '+1 (555) 876-5432', 'DL-CA-4491028', 'Active'),
        (3, 4, 'Michael Scott', '+1 (555) 345-6789', 'DL-PA-1102934', 'Active'),
        (4, None, 'David Miller', '+1 (555) 456-7890', 'DL-IL-5591023', 'On Leave'),
        (5, None, 'Emma Watson', '+1 (555) 678-9012', 'DL-WA-8837192', 'Active')
    ])

    cur.executemany("""
    INSERT INTO routes (route_id, origin, destination, distance, estimated_duration, fare, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, [
        (1, 'Addis Ababa', 'Bahir Dar', 565.00, '9h 30m', 650.00, 'Active'),
        (2, 'Addis Ababa', 'Hawassa', 275.00, '4h 30m', 320.00, 'Active'),
        (3, 'Addis Ababa', 'Dire Dawa', 445.00, '7h 45m', 550.00, 'Active'),
        (4, 'Addis Ababa', 'Mekelle', 780.00, '12h 00m', 850.00, 'Active'),
        (5, 'Addis Ababa', 'Jimma', 350.00, '6h 00m', 420.00, 'Active'),
        (6, 'Addis Ababa', "Debre Mark'os", 300.00, '5h 30m', 380.00, 'Active')
    ])

    dep1 = (now + datetime.timedelta(days=1)).strftime('%Y-%m-%d 08:00:00')
    arr1 = (now + datetime.timedelta(days=1, hours=9, minutes=30)).strftime('%Y-%m-%d %H:%M:%S')
    dep2 = (now + datetime.timedelta(days=2)).strftime('%Y-%m-%d 14:00:00')
    arr2 = (now + datetime.timedelta(days=2, hours=9, minutes=30)).strftime('%Y-%m-%d %H:%M:%S')
    dep3 = (now + datetime.timedelta(days=1)).strftime('%Y-%m-%d 09:30:00')
    arr3 = (now + datetime.timedelta(days=1, hours=4, minutes=30)).strftime('%Y-%m-%d %H:%M:%S')
    dep4 = (now + datetime.timedelta(days=3)).strftime('%Y-%m-%d 10:00:00')
    arr4 = (now + datetime.timedelta(days=3, hours=7, minutes=45)).strftime('%Y-%m-%d %H:%M:%S')
    dep5 = (now + datetime.timedelta(days=4)).strftime('%Y-%m-%d 07:30:00')
    arr5 = (now + datetime.timedelta(days=4, hours=12, minutes=0)).strftime('%Y-%m-%d %H:%M:%S')

    cur.executemany("""
    INSERT INTO schedules (schedule_id, bus_id, route_id, driver_id, departure_time, arrival_time, available_seats, fare, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, [
        (1, 1, 1, 1, dep1, arr1, 37, 650.00, 'Scheduled'),
        (2, 2, 1, 2, dep2, arr2, 36, 650.00, 'Scheduled'),
        (3, 3, 2, 3, dep3, arr3, 42, 320.00, 'Scheduled'),
        (4, 4, 3, 5, dep4, arr4, 40, 550.00, 'Scheduled'),
        (5, 6, 4, 1, dep5, arr5, 39, 850.00, 'Scheduled')
    ])

    cur.executemany("""
    INSERT INTO passengers (passenger_id, user_id, name, phone, email, status)
    VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, 5, 'Alice Smith', '+1 (555) 123-4567', 'alice.smith@gmail.com', 'Active'),
        (2, 6, 'Bob Jones', '+1 (555) 987-6543', 'bob.jones@yahoo.com', 'Active'),
        (3, 7, 'Clara Oswald', '+1 (555) 654-3210', 'clara.oswald@outlook.com', 'Active'),
        (4, None, 'Daniel Craig', '+1 (555) 789-0123', 'daniel.craig@gmail.com', 'Active')
    ])

    cur.executemany("""
    INSERT INTO bookings (booking_id, booking_reference, passenger_id, schedule_id, seat_number, booking_status)
    VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, 'TRIP-88201', 1, 1, '1A', 'Confirmed'),
        (2, 'TRIP-88202', 2, 1, '1B', 'Confirmed'),
        (3, 'TRIP-88203', 3, 1, '2C', 'Confirmed'),
        (4, 'TRIP-88204', 1, 3, '4A', 'Confirmed'),
        (5, 'TRIP-88205', 4, 3, '4B', 'Confirmed'),
        (6, 'TRIP-88206', 2, 5, '3A', 'Confirmed')
    ])

    cur.executemany("""
    INSERT INTO payments (payment_id, booking_id, amount, payment_method, payment_status, transaction_reference)
    VALUES (?, ?, ?, ?, ?, ?)
    """, [
        (1, 1, 35.00, 'Credit Card', 'Completed', 'TXN-CC-9901823'),
        (2, 2, 35.00, 'Mobile Payment', 'Completed', 'TXN-MP-7729104'),
        (3, 3, 35.00, 'Cash', 'Completed', 'TXN-CS-1102934'),
        (4, 4, 55.00, 'Credit Card', 'Completed', 'TXN-CC-8829105'),
        (5, 5, 55.00, 'Bank Transfer', 'Completed', 'TXN-BT-4491028'),
        (6, 6, 28.00, 'Mobile Payment', 'Completed', 'TXN-MP-6628190')
    ])

    conn.commit()
    conn.close()

def get_db_connection():
    """Retrieve an active SQLite3 database connection with Row factory and custom functions."""
    global _sqlite_initialized
    db_path = _get_sqlite_path()
    if not _sqlite_initialized:
        _init_sqlite_db(db_path)
        _sqlite_initialized = True

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    # Custom CONCAT function so standard SQL CONCAT(...) works smoothly in SQLite
    conn.create_function("CONCAT", -1, lambda *args: "".join(str(a) if a is not None else "" for a in args))
    return conn

def execute_query(query, params=None, fetch_all=False, fetch_one=False, commit=False):
    """
    Execute SQL statements on the SQLite3 database engine.
    Automatically maps %s parameter placeholders to ? and returns dictionary results.
    """
    conn = get_db_connection()
    if not conn:
        raise ConnectionError("Unable to establish connection to SQLite database.")

    cursor = None
    try:
        sqlite_query = query.replace("%s", "?")
        cursor = conn.cursor()
        cursor.execute(sqlite_query, params or ())
        result = None
        if fetch_one:
            row = cursor.fetchone()
            result = dict(row) if row else None
        elif fetch_all:
            rows = cursor.fetchall()
            result = [dict(r) for r in rows]
        elif commit:
            conn.commit()
            result = cursor.lastrowid or cursor.rowcount
        return result
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
