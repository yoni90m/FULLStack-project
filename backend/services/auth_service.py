import re
from backend.models.user import User
from backend.models.passenger import Passenger
from backend.utils.validators import validate_required_fields, validate_email
from backend.utils.security import generate_token

class AuthService:
    # Roles that users are allowed to self-assign during registration
    ALLOWED_SELF_REGISTRATION_ROLES = {'Passenger'}

    @staticmethod
    def register(data):
        valid, err = validate_required_fields(data, ['username', 'email', 'password'])
        if not valid:
            return False, err, None

        valid_email, email_err = validate_email(data['email'])
        if not valid_email:
            return False, email_err, None

        # ── Password Validation ──
        password = str(data['password'])
        if len(password) < 6:
            return False, "Password must be at least 6 characters long.", None

        # ── Sanitize username ──
        username = data['username'].strip()
        if len(username) < 3 or len(username) > 50:
            return False, "Username must be between 3 and 50 characters.", None
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            return False, "Username can only contain letters, numbers, and underscores.", None

        # ── Prevent role escalation — users can only self-register as Passenger ──
        requested_role = data.get('role', 'Passenger')
        if requested_role not in AuthService.ALLOWED_SELF_REGISTRATION_ROLES:
            return False, "Invalid registration role. Only 'Passenger' registration is allowed.", None

        # Check existing username or email
        existing = User.get_by_username_or_email(username)
        if existing:
            return False, "Username or email is already registered.", None

        existing_email = User.get_by_username_or_email(data['email'].strip())
        if existing_email:
            return False, "Email address is already registered.", None

        user_id = User.create(
            username=username,
            email=data['email'].strip(),
            password=password,
            role='Passenger'  # Always enforce Passenger role for self-registration
        )

        # Create passenger record
        passenger_id = Passenger.create(
            name=data.get('name', username).strip(),
            phone=data.get('phone', 'N/A').strip(),
            email=data['email'].strip(),
            user_id=user_id
        )

        # If passenger selected a bus schedule during registration, assign and book it immediately
        schedule_id = data.get('schedule_id')
        if schedule_id:
            try:
                schedule_id = int(schedule_id)
                seat_number = str(data.get('seat_number', '')).strip().upper()
                if not seat_number:
                    # Automatically select first free seat
                    from backend.models.booking import Booking
                    existing_bookings = Booking.get_all()
                    taken_seats = {
                        b['seat_number'] for b in existing_bookings 
                        if b.get('schedule_id') == schedule_id and b.get('booking_status') != 'Cancelled'
                    }
                    for row in range(1, 15):
                        for col in ['A', 'B', 'C', 'D']:
                            candidate = f"{row}{col}"
                            if candidate not in taken_seats:
                                seat_number = candidate
                                break
                        if seat_number:
                            break
                if not seat_number:
                    seat_number = "1A"

                from backend.services.booking_service import BookingService
                BookingService.create_booking({
                    "schedule_id": schedule_id,
                    "passenger_id": passenger_id,
                    "seat_number": seat_number,
                    "payment_method": data.get('payment_method', 'Cash')
                })
            except Exception as e:
                print(f"[Registration Booking Notice]: {e}")

        return True, "User registered successfully.", {"user_id": user_id, "passenger_id": passenger_id}

    @staticmethod
    def login(data):
        identifier = str(data.get('email') or data.get('username') or '').strip()
        password = str(data.get('password') or '').strip()
        if not identifier or not password:
            return False, "Please provide your email address and password.", None

        user = User.get_by_username_or_email(identifier)
        if not user:
            # Use generic message to prevent user enumeration
            return False, "Invalid email or password.", None

        if not User.verify_password(user['password'], password):
            return False, "Invalid email or password.", None

        if user.get('status') == 'Inactive':
            return False, "This account is inactive. Please contact administration.", None

        user_info = {
            "user_id": user['user_id'],
            "username": user['username'],
            "email": user['email'],
            "role": user['role']
        }

        # Generate a real, signed JWT token
        token = generate_token(user_info)

        return True, "Login successful.", {"user": user_info, "token": token}
