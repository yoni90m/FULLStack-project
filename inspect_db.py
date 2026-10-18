"""
TransLink Bus Transportation Management System
Database Inspector & Query Utility
Run anytime: python inspect_db.py
"""

import sys
import io

if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from backend.database.connection import execute_query

def print_divider(title):
    print("\n" + "=" * 65)
    print(f" [DB] {title}")
    print("=" * 65)

def inspect_database():
    print_divider("DATABASE SUMMARY (PostgreSQL: bus_transportation)")

    # 1. Table Counts
    tables = ['users', 'buses', 'drivers', 'routes', 'schedules', 'passengers', 'bookings', 'payments']
    print(f"{'Table Name':<20} | {'Record Count':<15}")
    print("-" * 38)
    for tbl in tables:
        count_res = execute_query(f"SELECT COUNT(*) as cnt FROM {tbl};", fetch_one=True)
        cnt = count_res['cnt'] if count_res else 0
        print(f"{tbl:<20} | {cnt:<15}")

    # 2. Payments (Telebirr, Mobile Banking, Cash)
    print_divider("PAYMENTS LEDGER (Telebirr, Mobile Banking, Cash)")
    payments = execute_query("""
        SELECT pm.payment_id, pm.transaction_reference, pm.payment_method, 
               pm.amount, pm.payment_status, b.booking_reference, p.name as passenger
        FROM payments pm
        LEFT JOIN bookings b ON pm.booking_id = b.booking_id
        LEFT JOIN passengers p ON b.passenger_id = p.passenger_id
        ORDER BY pm.payment_id ASC;
    """, fetch_all=True)

    print(f"{'ID':<4} | {'Reference':<18} | {'Method':<16} | {'Amount (ETB)':<14} | {'Status':<10} | {'Booking':<12} | {'Passenger'}")
    print("-" * 95)
    for p in payments:
        print(f"{p['payment_id']:<4} | {p['transaction_reference']:<18} | {p['payment_method']:<16} | ETB {float(p['amount']):<10.2f} | {p['payment_status']:<10} | {str(p.get('booking_reference') or 'N/A'):<12} | {str(p.get('passenger') or 'N/A')}")

    # 3. Routes & Fares
    print_divider("ACTIVE INTERCITY ROUTES & FARES")
    routes = execute_query("SELECT route_id, origin, destination, distance, estimated_duration, fare, status FROM routes ORDER BY route_id ASC;", fetch_all=True)
    print(f"{'ID':<4} | {'Origin → Destination':<30} | {'Distance':<10} | {'Duration':<10} | {'Fare (ETB)':<12} | {'Status'}")
    print("-" * 80)
    for r in routes:
        route_str = f"{r['origin']} → {r['destination']}"
        print(f"{r['route_id']:<4} | {route_str:<30} | {r['distance']} km   | {r['estimated_duration']:<10} | ETB {float(r['fare']):<8.2f} | {r['status']}")

    # 4. Bookings & Seat Numbers
    print_divider("CONFIRMED BOOKINGS & SEAT RESERVATIONS")
    bookings = execute_query("""
        SELECT b.booking_id, b.booking_reference, p.name as passenger, b.seat_number, 
               r.origin, r.destination, b.booking_status
        FROM bookings b
        LEFT JOIN passengers p ON b.passenger_id = p.passenger_id
        LEFT JOIN schedules s ON b.schedule_id = s.schedule_id
        LEFT JOIN routes r ON s.route_id = r.route_id
        ORDER BY b.booking_id ASC;
    """, fetch_all=True)

    print(f"{'Booking Ref':<14} | {'Passenger':<18} | {'Seat':<8} | {'Route':<30} | {'Status'}")
    print("-" * 80)
    for b in bookings:
        route_str = f"{b.get('origin') or ''} → {b.get('destination') or ''}"
        print(f"{b['booking_reference']:<14} | {str(b['passenger']):<18} | {b['seat_number']:<8} | {route_str:<30} | {b['booking_status']}")

    print("\n✅ End of database inspection.\n")

if __name__ == '__main__':
    inspect_database()
