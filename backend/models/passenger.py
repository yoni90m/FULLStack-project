from backend.database.connection import execute_query
from backend.utils.helpers import serialize_row

class Passenger:
    @staticmethod
    def get_all(bus_id=None):
        """
        Retrieve passengers who have booked tickets, arranged and grouped by their assigned bus.
        Registered users without bookings are excluded from this admin passenger manifest.
        """
        query = """
            SELECT 
                p.passenger_id,
                p.user_id,
                p.name,
                p.phone,
                p.email,
                p.status,
                b.booking_id,
                b.booking_reference,
                b.seat_number,
                b.booking_status,
                b.booking_date,
                bs.bus_id,
                bs.bus_number,
                bs.plate_number,
                bs.model as bus_model,
                s.schedule_id,
                s.departure_time,
                s.arrival_time,
                r.origin,
                r.destination,
                CONCAT(r.origin, ' → ', r.destination) as route_name
            FROM bookings b
            JOIN passengers p ON b.passenger_id = p.passenger_id
            JOIN schedules s ON b.schedule_id = s.schedule_id
            JOIN buses bs ON s.bus_id = bs.bus_id
            JOIN routes r ON s.route_id = r.route_id
            WHERE b.booking_status != 'Cancelled'
        """
        params = []
        if bus_id:
            query += " AND bs.bus_id = %s"
            params.append(bus_id)

        query += " ORDER BY bs.bus_number ASC, s.departure_time ASC, b.seat_number ASC"
        rows = execute_query(query, tuple(params) if params else None, fetch_all=True)
        return [serialize_row(r) for r in (rows or [])]

    @staticmethod
    def get_by_id(passenger_id):
        query = "SELECT * FROM passengers WHERE passenger_id = %s"
        row = execute_query(query, (passenger_id,), fetch_one=True)
        return serialize_row(row)

    @staticmethod
    def get_by_user_id(user_id):
        query = "SELECT * FROM passengers WHERE user_id = %s"
        row = execute_query(query, (user_id,), fetch_one=True)
        return serialize_row(row)

    @staticmethod
    def create(name, phone, email, user_id=None, status="Active"):
        query = """
            INSERT INTO passengers (user_id, name, phone, email, status)
            VALUES (%s, %s, %s, %s, %s)
        """
        return execute_query(query, (user_id, name, phone, email, status), commit=True)

    @staticmethod
    def update_status(passenger_id, status):
        query = "UPDATE passengers SET status = %s WHERE passenger_id = %s"
        return execute_query(query, (status, passenger_id), commit=True)
