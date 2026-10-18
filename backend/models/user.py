from werkzeug.security import generate_password_hash, check_password_hash
from backend.database.connection import execute_query
from backend.utils.helpers import serialize_row

class User:
    @staticmethod
    def create(username, email, password, role="Passenger"):
        hashed_pw = generate_password_hash(password)
        query = """
            INSERT INTO users (username, email, password, role, status)
            VALUES (%s, %s, %s, %s, 'Active')
        """
        user_id = execute_query(query, (username, email, hashed_pw, role), commit=True)
        return user_id

    @staticmethod
    def get_by_id(user_id):
        query = "SELECT user_id, username, email, role, status, created_at FROM users WHERE user_id = %s"
        row = execute_query(query, (user_id,), fetch_one=True)
        return serialize_row(row)

    @staticmethod
    def get_by_username_or_email(identifier):
        query = "SELECT * FROM users WHERE username = %s OR email = %s"
        row = execute_query(query, (identifier, identifier), fetch_one=True)
        return row

    @staticmethod
    def verify_password(stored_password, provided_password):
        """
        Verify a password against its stored hash.
        Only accepts bcrypt/werkzeug hashed passwords — no plaintext fallbacks.
        """
        if not stored_password or not provided_password:
            return False
        try:
            return check_password_hash(stored_password, provided_password)
        except Exception:
            return False

    @staticmethod
    def update_password(user_id, new_password):
        hashed_pw = generate_password_hash(new_password)
        query = "UPDATE users SET password = %s WHERE user_id = %s"
        return execute_query(query, (hashed_pw, user_id), commit=True)

    @staticmethod
    def update_profile(user_id, email=None, username=None):
        updates = []
        params = []
        if email:
            updates.append("email = %s")
            params.append(email)
        if username:
            updates.append("username = %s")
            params.append(username)
        if not updates:
            return False
        params.append(user_id)
        query = f"UPDATE users SET {', '.join(updates)} WHERE user_id = %s"
        return execute_query(query, tuple(params), commit=True)
