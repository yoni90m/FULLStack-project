from backend.database.connection import execute_query
from backend.utils.helpers import serialize_row, generate_reference

class Booking:
    @staticmethod
    def get_all(passenger_id=None, user_id=None):
        query = """
            SELECT b.*,
                   p.name as passenger_name, p.phone as passenger_phone, p.email as passenger_email,
                   p.user_id as passenger_user_id,
                   s.departure_time, s.arrival_time, s.fare,
                   bs.bus_number,
                   CONCAT(r.origin, ' → ', r.destination) as route_name,
                   pm.payment_status, pm.payment_method, pm.amount, pm.transaction_reference
            FROM bookings b
            LEFT JOIN passengers p ON b.passenger_id = p.passenger_id
            LEFT JOIN schedules s ON b.schedule_id = s.schedule_id
            LEFT JOIN buses bs ON s.bus_id = bs.bus_id
            LEFT JOIN routes r ON s.route_id = r.route_id
            LEFT JOIN payments pm ON b.booking_id = pm.booking_id
        """
        params = []
        if passenger_id:
            query += " WHERE b.passenger_id = %s"
            params.append(passenger_id)
        elif user_id:
            query += " WHERE p.user_id = %s"
            params.append(user_id)

        query += " ORDER BY b.booking_date DESC"
        rows = execute_query(query, tuple(params) if params else None, fetch_all=True)
        return [serialize_row(r) for r in (rows or [])]

    @staticmethod
    def get_by_id(booking_id):
        query = """
            SELECT b.*,
                   p.name as passenger_name, p.phone as passenger_phone, p.email as passenger_email,
                   p.user_id as passenger_user_id,
                   s.departure_time, s.arrival_time, s.fare,
                   bs.bus_number,
                   CONCAT(r.origin, ' → ', r.destination) as route_name,
                   pm.payment_status, pm.payment_method, pm.amount, pm.transaction_reference
            FROM bookings b
            LEFT JOIN passengers p ON b.passenger_id = p.passenger_id
            LEFT JOIN schedules s ON b.schedule_id = s.schedule_id
            LEFT JOIN buses bs ON s.bus_id = bs.bus_id
            LEFT JOIN routes r ON s.route_id = r.route_id
            LEFT JOIN payments pm ON b.booking_id = pm.booking_id
            WHERE b.booking_id = %s
        """
        row = execute_query(query, (booking_id,), fetch_one=True)
        return serialize_row(row)

    @staticmethod
    def is_seat_booked(schedule_id, seat_number):
        query = """
            SELECT booking_id FROM bookings
            WHERE schedule_id = %s AND seat_number = %s AND booking_status != 'Cancelled'
        """
        row = execute_query(query, (schedule_id, seat_number.upper()), fetch_one=True)
        return row is not None

    @staticmethod
    def create(passenger_id, schedule_id, seat_number, status="Confirmed"):
        ref = generate_reference("TRIP")
        query = """
            INSERT INTO bookings (booking_reference, passenger_id, schedule_id, seat_number, booking_status)
            VALUES (%s, %s, %s, %s, %s)
        """
        booking_id = execute_query(query, (ref, passenger_id, schedule_id, seat_number.upper(), status), commit=True)
        return booking_id, ref

    @staticmethod
    def update_status(booking_id, status):
        query = "UPDATE bookings SET booking_status = %s WHERE booking_id = %s"
        return execute_query(query, (status, booking_id), commit=True)

    @staticmethod
    def delete(booking_id):
        query = "DELETE FROM bookings WHERE booking_id = %s"
        return execute_query(query, (booking_id,), commit=True)
