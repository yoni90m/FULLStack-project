"""
PostgreSQL Database Connection & Query Execution Manager.
Provides thread-safe connections, automatic schema initialization, and foreign key enforcement.
"""

import re
import datetime
import psycopg2
import psycopg2.extras
from backend.config import Config

_db_initialized = False

# Mapping of database table names to their auto-increment primary key columns
TABLE_PK_MAP = {
    'users': 'user_id',
    'buses': 'bus_id',
    'drivers': 'driver_id',
    'routes': 'route_id',
    'schedules': 'schedule_id',
    'passengers': 'passenger_id',
    'bookings': 'booking_id',
    'payments': 'payment_id'
}

def _get_postgres_connection(dbname=None):
    """Establish a connection to PostgreSQL using psycopg2."""
    if Config.DATABASE_URL and dbname is None:
        return psycopg2.connect(Config.DATABASE_URL)
    db_to_connect = dbname if dbname is not None else Config.DB_NAME
    return psycopg2.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        dbname=db_to_connect
    )

def _init_postgres_db(force=False):
    """
    Ensure the PostgreSQL database exists, create schema tables, and seed initial data.
    """
    from werkzeug.security import generate_password_hash

    # 1. Connect to maintenance 'postgres' database to ensure application database exists (local only)
    if not Config.DATABASE_URL:
        try:
            conn = _get_postgres_connection(dbname='postgres')
            conn.autocommit = True
            cur = conn.cursor()
            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (Config.DB_NAME,))
            exists = cur.fetchone()
            if not exists:
                cur.execute(f'CREATE DATABASE "{Config.DB_NAME}"')
                print(f"[PostgreSQL]: Created database '{Config.DB_NAME}' successfully.")
            cur.close()
            conn.close()
        except Exception:
            # Ignore error if database already exists or user doesn't have CREATE DATABASE permission
            pass

    # 2. Connect to the application database and verify tables
    conn = _get_postgres_connection()
    cur = conn.cursor()

    if force:
        print(f"[PostgreSQL]: Resetting and re-seeding database '{Config.DB_NAME}' with Telebirr, Mobile Banking, and Cash records...")
        cur.execute("""
            DROP TABLE IF EXISTS payments CASCADE;
            DROP TABLE IF EXISTS bookings CASCADE;
            DROP TABLE IF EXISTS passengers CASCADE;
            DROP TABLE IF EXISTS schedules CASCADE;
            DROP TABLE IF EXISTS routes CASCADE;
            DROP TABLE IF EXISTS drivers CASCADE;
            DROP TABLE IF EXISTS buses CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        """)
    else:
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'users'
            );
        """)
        table_exists = cur.fetchone()[0]

        if table_exists:
            cur.execute("SELECT COUNT(*) FROM users;")
            user_count = cur.fetchone()[0]
            if user_count > 0:
                cur.close()
                conn.close()
                return

    print(f"[PostgreSQL]: Initializing tables and seed data in '{Config.DB_NAME}'...")

    # Create Tables
    cur.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(30) NOT NULL DEFAULT 'Passenger' CHECK (role IN ('Super Admin', 'Admin', 'Driver', 'Passenger')),
        status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS buses (
        bus_id SERIAL PRIMARY KEY,
        bus_number VARCHAR(30) NOT NULL UNIQUE,
        plate_number VARCHAR(30) NOT NULL UNIQUE,
        model VARCHAR(100) NOT NULL,
        capacity INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Assigned', 'Maintenance', 'Inactive')),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS drivers (
        driver_id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        license_number VARCHAR(50) NOT NULL UNIQUE,
        status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Suspended', 'Inactive')),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_driver_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS routes (
        route_id SERIAL PRIMARY KEY,
        origin VARCHAR(100) NOT NULL,
        destination VARCHAR(100) NOT NULL,
        distance NUMERIC(8, 2) NOT NULL,
        estimated_duration VARCHAR(50) NOT NULL,
        fare NUMERIC(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS schedules (
        schedule_id SERIAL PRIMARY KEY,
        bus_id INTEGER NOT NULL,
        route_id INTEGER NOT NULL,
        driver_id INTEGER NOT NULL,
        departure_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        arrival_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
        available_seats INTEGER NOT NULL,
        fare NUMERIC(10, 2) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Transit', 'Completed', 'Cancelled', 'Delayed')),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_sched_bus FOREIGN KEY (bus_id) REFERENCES buses (bus_id) ON DELETE CASCADE,
        CONSTRAINT fk_sched_route FOREIGN KEY (route_id) REFERENCES routes (route_id) ON DELETE CASCADE,
        CONSTRAINT fk_sched_driver FOREIGN KEY (driver_id) REFERENCES drivers (driver_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS passengers (
        passenger_id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        email VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_passenger_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
        booking_id SERIAL PRIMARY KEY,
        booking_reference VARCHAR(50) NOT NULL UNIQUE,
        passenger_id INTEGER NOT NULL,
        schedule_id INTEGER NOT NULL,
        seat_number VARCHAR(10) NOT NULL,
        booking_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        booking_status VARCHAR(20) NOT NULL DEFAULT 'Confirmed' CHECK (booking_status IN ('Confirmed', 'Pending', 'Cancelled', 'Checked-in')),
        CONSTRAINT fk_booking_passenger FOREIGN KEY (passenger_id) REFERENCES passengers (passenger_id) ON DELETE CASCADE,
        CONSTRAINT fk_booking_schedule FOREIGN KEY (schedule_id) REFERENCES schedules (schedule_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS payments (
        payment_id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status VARCHAR(20) NOT NULL DEFAULT 'Completed',
        payment_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        transaction_reference VARCHAR(100) NOT NULL UNIQUE,
        CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings (booking_id) ON DELETE CASCADE
    );
    """)

    # Seed initial datasets
    now = datetime.datetime.now()
    admin_hash = generate_password_hash('admin123')
    driver_hash = generate_password_hash('driver123')
    passenger_hash = generate_password_hash('passenger123')

    superadmin_hash = generate_password_hash('superadmin123')

    # Seed Users
    cur.executemany("""
    INSERT INTO users (username, email, password, role, status, created_at)
    VALUES (%s, %s, %s, %s, %s, %s)
    """, [
        ('superadmin', 'superadmin@translink.com', superadmin_hash, 'Super Admin', 'Active', now),
        ('admin', 'admin@translink.com', admin_hash, 'Admin', 'Active', now),
        ('driver_john', 'john.doe@translink.com', driver_hash, 'Driver', 'Active', now),
        ('driver_sarah', 'sarah.connor@translink.com', driver_hash, 'Driver', 'Active', now),
        ('driver_michael', 'michael.scott@translink.com', driver_hash, 'Driver', 'Active', now),
        ('alice_smith', 'alice.smith@gmail.com', passenger_hash, 'Passenger', 'Active', now),
        ('bob_jones', 'bob.jones@yahoo.com', passenger_hash, 'Passenger', 'Active', now),
        ('clara_oswald', 'clara.oswald@outlook.com', passenger_hash, 'Passenger', 'Active', now)
    ])

    # Seed Buses
    cur.executemany("""
    INSERT INTO buses (bus_number, plate_number, model, capacity, status)
    VALUES (%s, %s, %s, %s, %s)
    """, [
        ('BUS-101', 'NY-TR-8801', 'Volvo 9700 Luxury Cruiser', 40, 'Assigned'),
        ('BUS-102', 'MA-TR-4422', 'Mercedes-Benz Tourismo', 36, 'Available'),
        ('BUS-103', 'CA-TR-1290', 'Scania Touring HD', 44, 'Assigned'),
        ('BUS-104', 'IL-TR-9031', 'MCI J4500 Coach', 40, 'Available'),
        ('BUS-105', 'WA-TR-3384', 'Prevost H3-45 Executive', 32, 'Maintenance'),
        ('BUS-106', 'TX-TR-5519', 'Setra ComfortClass S 515', 40, 'Available'),
        ('BUS-107', 'FL-TR-7720', 'Volvo 9900 VIP Sleeper', 28, 'Inactive')
    ])

    # Seed Drivers (user_id shifted by 1 due to superadmin being user 1)
    cur.executemany("""
    INSERT INTO drivers (user_id, name, phone, license_number, status)
    VALUES (%s, %s, %s, %s, %s)
    """, [
        (3, 'John Doe', '+1 (555) 234-5678', 'DL-NY-9023812', 'Active'),
        (4, 'Sarah Connor', '+1 (555) 876-5432', 'DL-CA-4491028', 'Active'),
        (5, 'Michael Scott', '+1 (555) 345-6789', 'DL-PA-1102934', 'Active'),
        (None, 'David Miller', '+1 (555) 456-7890', 'DL-IL-5591023', 'On Leave'),
        (None, 'Emma Watson', '+1 (555) 678-9012', 'DL-WA-8837192', 'Active')
    ])

    # Seed Routes
    cur.executemany("""
    INSERT INTO routes (origin, destination, distance, estimated_duration, fare, status)
    VALUES (%s, %s, %s, %s, %s, %s)
    """, [
        ('Addis Ababa', 'Bahir Dar', 565.00, '9h 30m', 650.00, 'Active'),
        ('Addis Ababa', 'Hawassa', 275.00, '4h 30m', 320.00, 'Active'),
        ('Addis Ababa', 'Dire Dawa', 445.00, '7h 45m', 550.00, 'Active'),
        ('Addis Ababa', 'Mekelle', 780.00, '12h 00m', 850.00, 'Active'),
        ('Addis Ababa', 'Jimma', 350.00, '6h 00m', 420.00, 'Active'),
        ('Addis Ababa', "Debre Mark'os", 300.00, '5h 30m', 380.00, 'Active')
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

    # Seed Schedules
    cur.executemany("""
    INSERT INTO schedules (bus_id, route_id, driver_id, departure_time, arrival_time, available_seats, fare, status)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, [
        (1, 1, 1, dep1, arr1, 37, 650.00, 'Scheduled'),
        (2, 1, 2, dep2, arr2, 36, 650.00, 'Scheduled'),
        (3, 2, 3, dep3, arr3, 42, 320.00, 'Scheduled'),
        (4, 3, 5, dep4, arr4, 40, 550.00, 'Scheduled'),
        (6, 4, 1, dep5, arr5, 39, 850.00, 'Scheduled')
    ])

    # Seed Passengers (user_id shifted by 1 due to superadmin being user 1)
    cur.executemany("""
    INSERT INTO passengers (user_id, name, phone, email, status)
    VALUES (%s, %s, %s, %s, %s)
    """, [
        (6, 'Alice Smith', '+1 (555) 123-4567', 'alice.smith@gmail.com', 'Active'),
        (7, 'Bob Jones', '+1 (555) 987-6543', 'bob.jones@yahoo.com', 'Active'),
        (8, 'Clara Oswald', '+1 (555) 654-3210', 'clara.oswald@outlook.com', 'Active'),
        (None, 'Daniel Craig', '+1 (555) 789-0123', 'daniel.craig@gmail.com', 'Active')
    ])

    # Seed Bookings
    cur.executemany("""
    INSERT INTO bookings (booking_reference, passenger_id, schedule_id, seat_number, booking_status)
    VALUES (%s, %s, %s, %s, %s)
    """, [
        ('TRIP-88201', 1, 1, '1A', 'Confirmed'),
        ('TRIP-88202', 2, 1, '1B', 'Confirmed'),
        ('TRIP-88203', 3, 1, '2C', 'Confirmed'),
        ('TRIP-88204', 1, 3, '4A', 'Confirmed'),
        ('TRIP-88205', 4, 3, '4B', 'Confirmed'),
        ('TRIP-88206', 2, 5, '3A', 'Confirmed')
    ])

    # Seed Payments
    cur.executemany("""
    INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_reference)
    VALUES (%s, %s, %s, %s, %s)
    """, [
        (1, 650.00, 'Telebirr', 'Completed', 'TXN-TB-9901823'),
        (2, 650.00, 'Mobile Banking', 'Completed', 'TXN-MB-7729104'),
        (3, 650.00, 'Cash', 'Completed', 'TXN-CS-1102934'),
        (4, 320.00, 'Telebirr', 'Completed', 'TXN-TB-8829105'),
        (5, 320.00, 'Mobile Banking', 'Completed', 'TXN-MB-4491028'),
        (6, 850.00, 'Cash', 'Completed', 'TXN-CS-6628190')
    ])

    conn.commit()
    cur.close()
    conn.close()
    print("[PostgreSQL]: Database schema and sample data initialized successfully.")

def get_db_connection():
    """Retrieve an active PostgreSQL database connection."""
    global _db_initialized
    if not _db_initialized:
        _init_postgres_db()
        _db_initialized = True
    return _get_postgres_connection()

def _extract_table_for_insert(query):
    """Extract target table name from an INSERT INTO statement."""
    match = re.search(r'INSERT\s+INTO\s+([a-zA-Z0-9_]+)', query, re.IGNORECASE)
    if match:
        return match.group(1).lower()
    return None

def execute_query(query, params=None, fetch_all=False, fetch_one=False, commit=False):
    """
    Execute SQL statements on PostgreSQL with RealDictCursor.
    Automatically handles:
      - INSERT primary key retrieval via RETURNING
      - Decimal numeric value conversion to float
      - Dictionary result formatting
    """
    conn = get_db_connection()
    cursor = None
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        pg_query = query.strip()

        # Handle INSERT statement returning auto-increment PK in PostgreSQL
        is_insert = pg_query.upper().startswith("INSERT")
        if commit and is_insert and "RETURNING" not in pg_query.upper():
            tbl = _extract_table_for_insert(pg_query)
            pk_col = TABLE_PK_MAP.get(tbl, 'id')
            pg_query = f"{pg_query} RETURNING {pk_col}"
            cursor.execute(pg_query, params or ())
            row = cursor.fetchone()
            conn.commit()
            return row[pk_col] if row else cursor.rowcount

        cursor.execute(pg_query, params or ())
        result = None

        if fetch_one:
            row = cursor.fetchone()
            result = {k: (float(v) if hasattr(v, '__float__') and not isinstance(v, (int, float, bool)) else v) for k, v in row.items()} if row else None
        elif fetch_all:
            rows = cursor.fetchall()
            result = [{k: (float(v) if hasattr(v, '__float__') and not isinstance(v, (int, float, bool)) else v) for k, v in r.items()} for r in rows]
        elif commit:
            conn.commit()
            result = cursor.rowcount

        return result
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def reset_database():
    """Drop and recreate all tables and seed fresh sample data including Telebirr, Mobile Banking, and Cash."""
    _init_postgres_db(force=True)

if __name__ == '__main__':
    reset_database()

