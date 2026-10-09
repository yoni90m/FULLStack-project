-- ===================================================
-- Bus Transportation Management System
-- Backend Schema: backend/database/schema.sql
-- ===================================================

CREATE DATABASE IF NOT EXISTS `bus_transportation`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `bus_transportation`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `passengers`;
DROP TABLE IF EXISTS `schedules`;
DROP TABLE IF EXISTS `routes`;
DROP TABLE IF EXISTS `drivers`;
DROP TABLE IF EXISTS `buses`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `users` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('Admin', 'Driver', 'Passenger') NOT NULL DEFAULT 'Passenger',
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`),
    INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `buses` (
    `bus_id` INT AUTO_INCREMENT PRIMARY KEY,
    `bus_number` VARCHAR(30) NOT NULL UNIQUE,
    `plate_number` VARCHAR(30) NOT NULL UNIQUE,
    `model` VARCHAR(100) NOT NULL,
    `capacity` INT NOT NULL,
    `status` ENUM('Available', 'Assigned', 'Maintenance', 'Inactive') NOT NULL DEFAULT 'Available',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_buses_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `drivers` (
    `driver_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNIQUE NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `license_number` VARCHAR(50) NOT NULL UNIQUE,
    `status` ENUM('Active', 'On Leave', 'Suspended', 'Inactive') NOT NULL DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_driver_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX `idx_drivers_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `routes` (
    `route_id` INT AUTO_INCREMENT PRIMARY KEY,
    `origin` VARCHAR(100) NOT NULL,
    `destination` VARCHAR(100) NOT NULL,
    `distance` DECIMAL(8, 2) NOT NULL,
    `estimated_duration` VARCHAR(50) NOT NULL,
    `fare` DECIMAL(10, 2) NOT NULL DEFAULT 25.00,
    `status` ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_routes_origin_dest` (`origin`, `destination`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `schedules` (
    `schedule_id` INT AUTO_INCREMENT PRIMARY KEY,
    `bus_id` INT NOT NULL,
    `route_id` INT NOT NULL,
    `driver_id` INT NOT NULL,
    `departure_time` DATETIME NOT NULL,
    `arrival_time` DATETIME NOT NULL,
    `available_seats` INT NOT NULL,
    `fare` DECIMAL(10, 2) NOT NULL DEFAULT 25.00,
    `status` ENUM('Scheduled', 'Boarding', 'In Transit', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_schedule_bus` FOREIGN KEY (`bus_id`)
        REFERENCES `buses` (`bus_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_schedule_route` FOREIGN KEY (`route_id`)
        REFERENCES `routes` (`route_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_schedule_driver` FOREIGN KEY (`driver_id`)
        REFERENCES `drivers` (`driver_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX `idx_schedules_times` (`departure_time`, `arrival_time`),
    INDEX `idx_schedules_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `passengers` (
    `passenger_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT UNIQUE NULL,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `status` ENUM('Active', 'Disabled') NOT NULL DEFAULT 'Active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_passenger_user` FOREIGN KEY (`user_id`)
        REFERENCES `users` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX `idx_passengers_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `bookings` (
    `booking_id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_reference` VARCHAR(20) NOT NULL UNIQUE,
    `passenger_id` INT NOT NULL,
    `schedule_id` INT NOT NULL,
    `seat_number` VARCHAR(10) NOT NULL,
    `booking_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `booking_status` ENUM('Confirmed', 'Pending', 'Cancelled', 'Completed') NOT NULL DEFAULT 'Confirmed',
    CONSTRAINT `fk_booking_passenger` FOREIGN KEY (`passenger_id`)
        REFERENCES `passengers` (`passenger_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_booking_schedule` FOREIGN KEY (`schedule_id`)
        REFERENCES `schedules` (`schedule_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY `unique_schedule_seat` (`schedule_id`, `seat_number`),
    INDEX `idx_bookings_status` (`booking_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payments` (
    `payment_id` INT AUTO_INCREMENT PRIMARY KEY,
    `booking_id` INT NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `payment_method` ENUM('Cash', 'Bank Transfer', 'Mobile Payment', 'Credit Card', 'Other') NOT NULL,
    `payment_status` ENUM('Completed', 'Pending', 'Failed', 'Refunded') NOT NULL DEFAULT 'Completed',
    `payment_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `transaction_reference` VARCHAR(60) NOT NULL UNIQUE,
    CONSTRAINT `fk_payment_booking` FOREIGN KEY (`booking_id`)
        REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX `idx_payments_date` (`payment_date`),
    INDEX `idx_payments_status` (`payment_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
