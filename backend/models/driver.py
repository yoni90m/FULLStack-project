from backend.database.connection import execute_query
from backend.utils.helpers import serialize_row

class Driver:
    @staticmethod
    def get_all():
        query = "SELECT * FROM drivers ORDER BY driver_id ASC"
        rows = execute_query(query, fetch_all=True)
        return [serialize_row(r) for r in (rows or [])]

    @staticmethod
    def get_by_id(driver_id):
        query = "SELECT * FROM drivers WHERE driver_id = %s"
        row = execute_query(query, (driver_id,), fetch_one=True)
        return serialize_row(row)

    @staticmethod
    def get_by_license(license_number, exclude_id=None):
        if exclude_id:
            query = "SELECT * FROM drivers WHERE license_number = %s AND driver_id != %s"
            return execute_query(query, (license_number, exclude_id), fetch_one=True)
        query = "SELECT * FROM drivers WHERE license_number = %s"
        return execute_query(query, (license_number,), fetch_one=True)

    @staticmethod
    def create(name, phone, license_number, user_id=None, status="Active"):
        query = """
            INSERT INTO drivers (user_id, name, phone, license_number, status)
            VALUES (%s, %s, %s, %s, %s)
        """
        return execute_query(query, (user_id, name, phone, license_number, status), commit=True)

    @staticmethod
    def update(driver_id, name, phone, license_number, status):
        query = """
            UPDATE drivers
            SET name = %s, phone = %s, license_number = %s, status = %s
            WHERE driver_id = %s
        """
        return execute_query(query, (name, phone, license_number, status, driver_id), commit=True)

    @staticmethod
    def delete(driver_id):
        query = "DELETE FROM drivers WHERE driver_id = %s"
        return execute_query(query, (driver_id,), commit=True)
