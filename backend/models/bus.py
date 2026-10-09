from backend.database.connection import execute_query
from backend.utils.helpers import serialize_row

class Bus:
    @staticmethod
    def get_all():
        query = "SELECT * FROM buses ORDER BY bus_id ASC"
        rows = execute_query(query, fetch_all=True)
        return [serialize_row(r) for r in (rows or [])]

    @staticmethod
    def get_by_id(bus_id):
        query = "SELECT * FROM buses WHERE bus_id = %s"
        row = execute_query(query, (bus_id,), fetch_one=True)
        return serialize_row(row)

    @staticmethod
    def get_by_plate_or_number(plate_number, bus_number, exclude_id=None):
        if exclude_id:
            query = "SELECT * FROM buses WHERE (plate_number = %s OR bus_number = %s) AND bus_id != %s"
            return execute_query(query, (plate_number, bus_number, exclude_id), fetch_one=True)
        query = "SELECT * FROM buses WHERE plate_number = %s OR bus_number = %s"
        return execute_query(query, (plate_number, bus_number), fetch_one=True)

    @staticmethod
    def create(bus_number, plate_number, model, capacity, status="Available"):
        query = """
            INSERT INTO buses (bus_number, plate_number, model, capacity, status)
            VALUES (%s, %s, %s, %s, %s)
        """
        return execute_query(query, (bus_number, plate_number, model, capacity, status), commit=True)

    @staticmethod
    def update(bus_id, bus_number, plate_number, model, capacity, status):
        query = """
            UPDATE buses
            SET bus_number = %s, plate_number = %s, model = %s, capacity = %s, status = %s
            WHERE bus_id = %s
        """
        return execute_query(query, (bus_number, plate_number, model, capacity, status, bus_id), commit=True)

    @staticmethod
    def delete(bus_id):
        query = "DELETE FROM buses WHERE bus_id = %s"
        return execute_query(query, (bus_id,), commit=True)
