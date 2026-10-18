-- ===================================================
-- Bus Transportation Management System
-- Seed Data: backend/database/seed.sql
-- Default Passwords:
-- admin: admin123
-- driver_john: driver123
-- driver_sarah: driver123
-- alice_smith: passenger123
-- bob_jones: passenger123
-- ===================================================

USE `bus_transportation`;

-- Disable FK checks temporarily for clean insert
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `payments`;
TRUNCATE TABLE `bookings`;
TRUNCATE TABLE `passengers`;
TRUNCATE TABLE `schedules`;
TRUNCATE TABLE `routes`;
TRUNCATE TABLE `drivers`;
TRUNCATE TABLE `buses`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS
-- Default passwords:
-- admin: admin123
-- driver: driver123
-- passenger: passenger123
INSERT INTO `users` (`user_id`, `username`, `email`, `password`, `role`, `status`, `created_at`) VALUES
(1, 'admin', 'admin@translink.com', 'scrypt:32768:8:1$FMQ8mPveO1dAPhYJ$38923a9b95115e03e695603f54cbea14ef43e84d8cae5d03587c39750c5d118de01a79b0407d15d6e81b0839d669ac3f7861732f64123daf3383271ab8f881f1', 'Admin', 'Active', NOW()),
(2, 'driver_john', 'john.doe@translink.com', 'scrypt:32768:8:1$Hl5KiDQUQpxLFn6e$d82ef3b89a9fe20a2cfa9b7443de26f6944504526539514a7275eb3e36d62e7a5f3ed847e8add645bfc121911b0ee56f4f17bd7ccf7b414a95e5404ccc55f446', 'Driver', 'Active', NOW()),
(3, 'driver_sarah', 'sarah.connor@translink.com', 'scrypt:32768:8:1$Hl5KiDQUQpxLFn6e$d82ef3b89a9fe20a2cfa9b7443de26f6944504526539514a7275eb3e36d62e7a5f3ed847e8add645bfc121911b0ee56f4f17bd7ccf7b414a95e5404ccc55f446', 'Driver', 'Active', NOW()),
(4, 'driver_michael', 'michael.scott@translink.com', 'scrypt:32768:8:1$Hl5KiDQUQpxLFn6e$d82ef3b89a9fe20a2cfa9b7443de26f6944504526539514a7275eb3e36d62e7a5f3ed847e8add645bfc121911b0ee56f4f17bd7ccf7b414a95e5404ccc55f446', 'Driver', 'Active', NOW()),
(5, 'alice_smith', 'alice.smith@gmail.com', 'scrypt:32768:8:1$jDGI7BQIdzWHvcW1$f1c9e7d86192daba58aa36556802b5916ad1bedb1e55cc7c84b182234ca32f0477ede3ad99a69618a94cb0c5075e71d4cc6a92b6ecfc0d0fc50bbe125b2bb7d7', 'Passenger', 'Active', NOW()),
(6, 'bob_jones', 'bob.jones@yahoo.com', 'scrypt:32768:8:1$jDGI7BQIdzWHvcW1$f1c9e7d86192daba58aa36556802b5916ad1bedb1e55cc7c84b182234ca32f0477ede3ad99a69618a94cb0c5075e71d4cc6a92b6ecfc0d0fc50bbe125b2bb7d7', 'Passenger', 'Active', NOW()),
(7, 'clara_oswald', 'clara.oswald@outlook.com', 'scrypt:32768:8:1$jDGI7BQIdzWHvcW1$f1c9e7d86192daba58aa36556802b5916ad1bedb1e55cc7c84b182234ca32f0477ede3ad99a69618a94cb0c5075e71d4cc6a92b6ecfc0d0fc50bbe125b2bb7d7', 'Passenger', 'Active', NOW());

-- 2. BUSES
INSERT INTO `buses` (`bus_id`, `bus_number`, `plate_number`, `model`, `capacity`, `status`, `created_at`) VALUES
(1, 'BUS-101', 'NY-TR-8801', 'Volvo 9700 Luxury Cruiser', 40, 'Assigned', NOW()),
(2, 'BUS-102', 'MA-TR-4422', 'Mercedes-Benz Tourismo', 36, 'Available', NOW()),
(3, 'BUS-103', 'CA-TR-1290', 'Scania Touring HD', 44, 'Assigned', NOW()),
(4, 'BUS-104', 'IL-TR-9031', 'MCI J4500 Coach', 40, 'Available', NOW()),
(5, 'BUS-105', 'WA-TR-3384', 'Prevost H3-45 Executive', 32, 'Maintenance', NOW()),
(6, 'BUS-106', 'TX-TR-5519', 'Setra ComfortClass S 515', 40, 'Available', NOW()),
(7, 'BUS-107', 'FL-TR-7720', 'Volvo 9900 VIP Sleeper', 28, 'Inactive', NOW());

-- 3. DRIVERS
INSERT INTO `drivers` (`driver_id`, `user_id`, `name`, `phone`, `license_number`, `status`, `created_at`) VALUES
(1, 2, 'John Doe', '+1 (555) 234-5678', 'DL-NY-9023812', 'Active', NOW()),
(2, 3, 'Sarah Connor', '+1 (555) 876-5432', 'DL-CA-4491028', 'Active', NOW()),
(3, 4, 'Michael Scott', '+1 (555) 345-6789', 'DL-PA-1102934', 'Active', NOW()),
(4, NULL, 'David Miller', '+1 (555) 456-7890', 'DL-IL-5591023', 'On Leave', NOW()),
(5, NULL, 'Emma Watson', '+1 (555) 678-9012', 'DL-WA-8837192', 'Active', NOW());

-- 4. ROUTES
INSERT INTO `routes` (`route_id`, `origin`, `destination`, `distance`, `estimated_duration`, `fare`, `status`, `created_at`) VALUES
(1, 'Addis Ababa', 'Bahir Dar', 565.00, '9h 30m', 650.00, 'Active', NOW()),
(2, 'Addis Ababa', 'Hawassa', 275.00, '4h 30m', 320.00, 'Active', NOW()),
(3, 'Addis Ababa', 'Dire Dawa', 445.00, '7h 45m', 550.00, 'Active', NOW()),
(4, 'Addis Ababa', 'Mekelle', 780.00, '12h 00m', 850.00, 'Active', NOW()),
(5, 'Addis Ababa', 'Jimma', 350.00, '6h 00m', 420.00, 'Active', NOW()),
(6, 'Addis Ababa', 'Debre Mark\'os', 300.00, '5h 30m', 380.00, 'Active', NOW());

-- 5. SCHEDULES
-- Scheduled upcoming trips
INSERT INTO `schedules` (`schedule_id`, `bus_id`, `route_id`, `driver_id`, `departure_time`, `arrival_time`, `available_seats`, `fare`, `status`, `created_at`) VALUES
(1, 1, 1, 1, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL '1 9:30' DAY_MINUTE), 37, 650.00, 'Scheduled', NOW()),
(2, 2, 1, 2, DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL '2 9:30' DAY_MINUTE), 36, 650.00, 'Scheduled', NOW()),
(3, 3, 2, 3, DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL '1 4:30' DAY_MINUTE), 42, 320.00, 'Scheduled', NOW()),
(4, 4, 3, 5, DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL '3 7:45' DAY_MINUTE), 40, 550.00, 'Scheduled', NOW()),
(5, 6, 4, 1, DATE_ADD(NOW(), INTERVAL 4 DAY), DATE_ADD(NOW(), INTERVAL '4 12:00' DAY_MINUTE), 39, 850.00, 'Scheduled', NOW());

-- 6. PASSENGERS
INSERT INTO `passengers` (`passenger_id`, `user_id`, `name`, `phone`, `email`, `status`, `created_at`) VALUES
(1, 5, 'Alice Smith', '+1 (555) 123-4567', 'alice.smith@gmail.com', 'Active', NOW()),
(2, 6, 'Bob Jones', '+1 (555) 987-6543', 'bob.jones@yahoo.com', 'Active', NOW()),
(3, 7, 'Clara Oswald', '+1 (555) 654-3210', 'clara.oswald@outlook.com', 'Active', NOW()),
(4, NULL, 'Daniel Craig', '+1 (555) 789-0123', 'daniel.craig@gmail.com', 'Active', NOW());

-- 7. BOOKINGS
INSERT INTO `bookings` (`booking_id`, `booking_reference`, `passenger_id`, `schedule_id`, `seat_number`, `booking_date`, `booking_status`) VALUES
(1, 'TRIP-88201', 1, 1, '1A', DATE_SUB(NOW(), INTERVAL 2 DAY), 'Confirmed'),
(2, 'TRIP-88202', 2, 1, '1B', DATE_SUB(NOW(), INTERVAL 1 DAY), 'Confirmed'),
(3, 'TRIP-88203', 3, 1, '2C', DATE_SUB(NOW(), INTERVAL 6 HOUR), 'Confirmed'),
(4, 'TRIP-88204', 1, 3, '4A', DATE_SUB(NOW(), INTERVAL 12 HOUR), 'Confirmed'),
(5, 'TRIP-88205', 4, 3, '4B', DATE_SUB(NOW(), INTERVAL 5 HOUR), 'Confirmed'),
(6, 'TRIP-88206', 2, 5, '3A', DATE_SUB(NOW(), INTERVAL 3 HOUR), 'Confirmed');

-- 8. PAYMENTS
INSERT INTO `payments` (`payment_id`, `booking_id`, `amount`, `payment_method`, `payment_status`, `payment_date`, `transaction_reference`) VALUES
(1, 1, 650.00, 'Telebirr', 'Completed', DATE_SUB(NOW(), INTERVAL 2 DAY), 'TXN-TB-9901823'),
(2, 2, 650.00, 'Mobile Banking', 'Completed', DATE_SUB(NOW(), INTERVAL 1 DAY), 'TXN-MB-7729104'),
(3, 3, 650.00, 'Cash', 'Completed', DATE_SUB(NOW(), INTERVAL 6 HOUR), 'TXN-CS-1102934'),
(4, 4, 320.00, 'Telebirr', 'Completed', DATE_SUB(NOW(), INTERVAL 12 HOUR), 'TXN-TB-8829105'),
(5, 5, 320.00, 'Mobile Banking', 'Completed', DATE_SUB(NOW(), INTERVAL 5 HOUR), 'TXN-MB-4491028'),
(6, 6, 850.00, 'Cash', 'Completed', DATE_SUB(NOW(), INTERVAL 3 HOUR), 'TXN-CS-6628190');
