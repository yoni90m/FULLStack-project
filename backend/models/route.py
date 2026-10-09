from backend.database.connection import execute_query
from backend.utils.helpers import serialize_row

class Route:
    @staticmethod
    def get_all():
        query = "SELECT * FROM routes ORDER BY route_id ASC"
        rows = execute_query(query, fetch_all=True)
        return [serialize_row(r) for r in (rows or [])]

    @staticmethod
    def get_by_id(route_id):
        query = "SELECT * FROM routes WHERE route_id = %s"
        row = execute_query(query, (route_id,), fetch_one=True)
        return serialize_row(row)

    @staticmethod
    def create(origin, destination, distance, estimated_duration, fare=25.00, status="Active"):
        query = """
            INSERT INTO routes (origin, destination, distance, estimated_duration, fare, status)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        return execute_query(query, (origin, destination, distance, estimated_duration, fare, status), commit=True)

    @staticmethod
    def update(route_id, origin, destination, distance, estimated_duration, fare, status):
        query = """
            UPDATE routes
            SET origin = %s, destination = %s, distance = %s, estimated_duration = %s, fare = %s, status = %s
            WHERE route_id = %s
        """
        return execute_query(query, (origin, destination, distance, estimated_duration, fare, status, route_id), commit=True)

    @staticmethod
    def delete(route_id):
        query = "DELETE FROM routes WHERE route_id = %s"
        return execute_query(query, (route_id,), commit=True)
