from backend.database.connection import execute_query
from backend.utils.helpers import serialize_row, generate_reference

class Payment:
    @staticmethod
    def get_all(passenger_id=None, user_id=None):
        query = """
            SELECT pm.*,
                   b.booking_reference,
                   p.name as passenger_name,
                   p.user_id as passenger_user_id
            FROM payments pm
            LEFT JOIN bookings b ON pm.booking_id = b.booking_id
            LEFT JOIN passengers p ON b.passenger_id = p.passenger_id
        """
        params = []
        if passenger_id:
            query += " WHERE b.passenger_id = %s"
            params.append(passenger_id)
        elif user_id:
            query += " WHERE p.user_id = %s"
            params.append(user_id)

        query += " ORDER BY pm.payment_date DESC"
        rows = execute_query(query, tuple(params) if params else None, fetch_all=True)
        return [serialize_row(r) for r in (rows or [])]

    @staticmethod
    def get_by_id(payment_id):
        query = """
            SELECT pm.*,
                   b.booking_reference,
                   p.name as passenger_name,
                   p.user_id as passenger_user_id
            FROM payments pm
            LEFT JOIN bookings b ON pm.booking_id = b.booking_id
            LEFT JOIN passengers p ON b.passenger_id = p.passenger_id
            WHERE pm.payment_id = %s
        """
        row = execute_query(query, (payment_id,), fetch_one=True)
        return serialize_row(row)

    @staticmethod
    def create(booking_id, amount, payment_method="Credit Card", payment_status="Completed"):
        prefix_map = {
            "credit card": "TXN-CC",
            "mobile payment": "TXN-MP",
            "cash": "TXN-CS",
            "bank transfer": "TXN-BT"
        }
        prefix = prefix_map.get(payment_method.lower(), "TXN")
        ref = generate_reference(prefix)
        query = """
            INSERT INTO payments (booking_id, amount, payment_method, payment_status, transaction_reference)
            VALUES (%s, %s, %s, %s, %s)
        """
        payment_id = execute_query(query, (booking_id, amount, payment_method, payment_status, ref), commit=True)
        return payment_id, ref

    @staticmethod
    def update_status(payment_id, status):
        query = "UPDATE payments SET payment_status = %s WHERE payment_id = %s"
        return execute_query(query, (status, payment_id), commit=True)
