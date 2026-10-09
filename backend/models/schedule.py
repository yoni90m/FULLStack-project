from backend.database.connection import execute_query
from backend.utils.helpers import serialize_row

class Schedule:
    @staticmethod
    def get_all():
        query = """
            SELECT s.*, 
                   b.bus_number, b.model as bus_model, b.capacity,
                   r.origin, r.destination, r.distance, r.estimated_duration,
                   CONCAT(r.origin, ' → ', r.destination) as route_name,
                   d.name as driver_name, d.phone as driver_phone
            FROM schedules s
            LEFT JOIN buses b ON s.bus_id = b.bus_id
            LEFT JOIN routes r ON s.route_id = r.route_id
            LEFT JOIN drivers d ON s.driver_id = d.driver_id
            ORDER BY s.departure_time ASC
        """
        rows = execute_query(query, fetch_all=True)
        return [serialize_row(r) for r in (rows or [])]

    @staticmethod
    def get_by_id(schedule_id):
        query = """
            SELECT s.*, 
                   b.bus_number, b.model as bus_model, b.capacity,
                   r.origin, r.destination, r.distance, r.estimated_duration,
                   CONCAT(r.origin, ' → ', r.destination) as route_name,
                   d.name as driver_name, d.phone as driver_phone
            FROM schedules s
            LEFT JOIN buses b ON s.bus_id = b.bus_id
            LEFT JOIN routes r ON s.route_id = r.route_id
            LEFT JOIN drivers d ON s.driver_id = d.driver_id
            WHERE s.schedule_id = %s
        """
        row = execute_query(query, (schedule_id,), fetch_one=True)
        return serialize_row(row)

    @staticmethod
    def check_conflicts(bus_id, driver_id, departure_time, arrival_time, exclude_schedule_id=None):
        """
        Check if the bus or driver has overlapping scheduled trips.
        Overlap condition: new_departure < existing_arrival AND new_arrival > existing_departure
        """
        base_query = """
            SELECT schedule_id, bus_id, driver_id, departure_time, arrival_time
            FROM schedules
            WHERE status != 'Cancelled'
              AND (%s < arrival_time AND %s > departure_time)
        """
        params = [departure_time, arrival_time]
        if exclude_schedule_id:
            base_query += " AND schedule_id != %s"
            params.append(exclude_schedule_id)

        rows = execute_query(base_query, tuple(params), fetch_all=True)
        for r in (rows or []):
            if r['bus_id'] == bus_id:
                return True, "Bus is already assigned to another schedule during this time frame."
            if r['driver_id'] == driver_id:
                return True, "Driver is already assigned to another schedule during this time frame."
        return False, None

    @staticmethod
    def create(bus_id, route_id, driver_id, departure_time, arrival_time, available_seats, fare=25.00, status="Scheduled"):
        query = """
            INSERT INTO schedules (bus_id, route_id, driver_id, departure_time, arrival_time, available_seats, fare, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        return execute_query(query, (bus_id, route_id, driver_id, departure_time, arrival_time, available_seats, fare, status), commit=True)

    @staticmethod
    def update(schedule_id, bus_id, route_id, driver_id, departure_time, arrival_time, fare, status):
        query = """
            UPDATE schedules
            SET bus_id = %s, route_id = %s, driver_id = %s, departure_time = %s, arrival_time = %s, fare = %s, status = %s
            WHERE schedule_id = %s
        """
        return execute_query(query, (bus_id, route_id, driver_id, departure_time, arrival_time, fare, status, schedule_id), commit=True)

    @staticmethod
    def decrement_seats(schedule_id):
        query = "UPDATE schedules SET available_seats = available_seats - 1 WHERE schedule_id = %s AND available_seats > 0"
        return execute_query(query, (schedule_id,), commit=True)

    @staticmethod
    def increment_seats(schedule_id):
        query = "UPDATE schedules SET available_seats = available_seats + 1 WHERE schedule_id = %s"
        return execute_query(query, (schedule_id,), commit=True)

    @staticmethod
    def delete(schedule_id):
        query = "DELETE FROM schedules WHERE schedule_id = %s"
        return execute_query(query, (schedule_id,), commit=True)
