-- ===================================================
-- TransLink Bus Transportation Management System
-- PostgreSQL 18 Database Schema & Seed Data
-- ===================================================

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS passengers CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS buses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'Passenger' CHECK (role IN ('Super Admin', 'Admin', 'Driver', 'Passenger')),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- 2. Buses Table
CREATE TABLE buses (
    bus_id SERIAL PRIMARY KEY,
    bus_number VARCHAR(30) NOT NULL UNIQUE,
    plate_number VARCHAR(30) NOT NULL UNIQUE,
    model VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Assigned', 'Maintenance', 'Inactive')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buses_status ON buses(status);

-- 3. Drivers Table
CREATE TABLE drivers (
    driver_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Suspended', 'Inactive')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_driver_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL
);

CREATE INDEX idx_drivers_status ON drivers(status);

-- 4. Routes Table
CREATE TABLE routes (
    route_id SERIAL PRIMARY KEY,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    distance NUMERIC(8, 2) NOT NULL,
    estimated_duration VARCHAR(50) NOT NULL,
    fare NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_diff_origin_dest CHECK (origin <> destination)
);

CREATE INDEX idx_routes_origin_dest ON routes(origin, destination);

-- 5. Schedules Table
CREATE TABLE schedules (
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
    CONSTRAINT fk_sched_driver FOREIGN KEY (driver_id) REFERENCES drivers (driver_id) ON DELETE CASCADE,
    CONSTRAINT chk_time_window CHECK (arrival_time > departure_time)
);

CREATE INDEX idx_schedules_departure ON schedules(departure_time);
CREATE INDEX idx_schedules_status ON schedules(status);

-- 6. Passengers Table
CREATE TABLE passengers (
    passenger_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_passenger_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL
);

CREATE INDEX idx_passengers_email ON passengers(email);

-- 7. Bookings Table
CREATE TABLE bookings (
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

CREATE INDEX idx_bookings_schedule ON bookings(schedule_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);

-- 8. Payments Table
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('Telebirr', 'Mobile Banking', 'Cash', 'Credit Card', 'Mobile Payment', 'Bank Transfer', 'Debit Card', 'Other')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Completed' CHECK (payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
    payment_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    transaction_reference VARCHAR(100) NOT NULL UNIQUE,
    CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings (booking_id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_status ON payments(payment_status);
CREATE INDEX idx_payments_date ON payments(payment_date);
