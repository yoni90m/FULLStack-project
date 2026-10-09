import re

def validate_required_fields(data, required_fields):
    """Ensure all required keys are present and not empty."""
    if not isinstance(data, dict):
        return False, "Invalid request payload format."
    missing = [f for f in required_fields if f not in data or data[f] is None or str(data[f]).strip() == ""]
    if missing:
        return False, f"Missing required fields: {', '.join(missing)}"
    return True, None

def validate_email(email):
    """Validate email address format."""
    if not email:
        return False, "Email cannot be empty."
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if not re.match(pattern, email.strip()):
        return False, "Invalid email address format."
    return True, None

def validate_phone(phone):
    """Validate phone number."""
    if not phone or len(phone.strip()) < 7:
        return False, "Phone number must be at least 7 digits."
    return True, None

def validate_bus_capacity(capacity):
    """Validate positive integer capacity."""
    try:
        cap = int(capacity)
        if cap <= 0 or cap > 100:
            return False, "Capacity must be an integer between 1 and 100."
        return True, None
    except (ValueError, TypeError):
        return False, "Capacity must be a valid integer."

def validate_route(origin, destination, distance):
    """Validate origin, destination, and distance."""
    if not origin or not destination:
        return False, "Origin and destination are required."
    if origin.strip().lower() == destination.strip().lower():
        return False, "Origin and destination cannot be identical."
    try:
        dist = float(distance)
        if dist <= 0:
            return False, "Distance must be a positive number."
    except (ValueError, TypeError):
        return False, "Distance must be a valid numeric value."
    return True, None

def validate_seat_number(seat_number):
    """Validate seat format (e.g. 1A, 10D)."""
    if not seat_number:
        return False, "Seat number is required."
    pattern = r"^[1-9][0-9]?[A-D]$"
    if not re.match(pattern, seat_number.strip().upper()):
        return False, "Invalid seat format. Expected e.g. 1A, 2B, 10D."
    return True, None
