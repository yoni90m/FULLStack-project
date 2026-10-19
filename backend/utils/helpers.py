import secrets
import datetime
from flask import jsonify

def json_response(success=True, message="", data=None, status_code=200):
    """Standardized JSON API response."""
    payload = {
        "success": success,
        "message": message
    }
    if data is not None:
        payload["data"] = data
    return jsonify(payload), status_code

def generate_reference(prefix="TRIP"):
    """Generate cryptographically unique tracking reference code."""
    rand_hex = secrets.token_hex(4).upper()
    return f"{prefix}-{rand_hex}"

def serialize_row(row):
    """Convert datetime / decimal objects in database dictionary row to JSON-friendly format."""
    if not row or not isinstance(row, dict):
        return row
    result = {}
    for k, v in row.items():
        if isinstance(v, (datetime.datetime, datetime.date)):
            result[k] = v.strftime("%Y-%m-%d %H:%M:%S")
        elif isinstance(v, bool):
            result[k] = v
        elif isinstance(v, int):
            result[k] = v
        elif hasattr(v, '__float__'):
            result[k] = float(v)
        else:
            result[k] = v
    return result
