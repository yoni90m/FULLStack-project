from flask import Blueprint
from backend.models.bus import Bus
from backend.models.driver import Driver
from backend.models.route import Route
from backend.models.passenger import Passenger
from backend.models.booking import Booking
from backend.models.payment import Payment
from backend.utils.helpers import json_response
from backend.utils.security import auth_required, role_required

report_bp = Blueprint('report_bp', __name__)

@report_bp.route('/stats', methods=['GET'])
@auth_required
@role_required('Admin')
def get_dashboard_stats():
    buses = Bus.get_all()
    drivers = Driver.get_all()
    routes = Route.get_all()
    passengers = Passenger.get_all()
    bookings = Booking.get_all()
    payments = Payment.get_all()

    total_revenue = sum(
        float(p['amount']) for p in payments 
        if p.get('payment_status') == 'Completed' and p.get('amount')
    )

    data = {
        "total_buses": len(buses),
        "total_drivers": len(drivers),
        "total_routes": len(routes),
        "total_passengers": len(passengers),
        "total_bookings": len(bookings),
        "total_revenue": f"{total_revenue:.2f}",
        "active_buses": len([b for b in buses if b.get('status') in ['Available', 'Assigned']])
    }
    return json_response(True, "Executive dashboard metrics calculated.", data)

# ── Mock/In-memory store for Incident Reports, Audit Logs, and Settings ──
INCIDENT_REPORTS = [
    {
        "id": 1,
        "driver_name": "John Doe",
        "bus_number": "BUS-101",
        "route": "Addis Ababa → Bahir Dar",
        "issue_type": "Delay",
        "description": "Heavy rain and fog near Sululta mountain pass caused a 25-minute delay.",
        "status": "Under Review",
        "reported_at": "2026-10-09 09:15"
    },
    {
        "id": 2,
        "driver_name": "Sarah Connor",
        "bus_number": "BUS-102",
        "route": "Addis Ababa → Hawassa",
        "issue_type": "Maintenance Needed",
        "description": "Right front tire pressure low sensor triggered. Needs inspection at Mojo station.",
        "status": "Resolved",
        "reported_at": "2026-10-08 14:30"
    }
]

AUDIT_LOGS = [
    {"id": 1, "username": "admin", "action": "CREATE_SCHEDULE", "details": "Scheduled trip Addis Ababa → Bahir Dar (BUS-101)", "timestamp": "2026-10-10 08:30:15"},
    {"id": 2, "username": "admin", "action": "UPDATE_BUS_STATUS", "details": "Set BUS-105 status to Maintenance", "timestamp": "2026-10-10 09:12:00"},
    {"id": 3, "username": "driver_john", "action": "TRIP_STATUS_UPDATE", "details": "Updated TRIP #1 status to 'In Transit'", "timestamp": "2026-10-10 10:00:22"},
    {"id": 4, "username": "admin", "action": "UPDATE_FARE", "details": "Updated Addis Ababa → Hawassa fare to ETB 320.00", "timestamp": "2026-10-10 11:45:00"},
]

SYSTEM_SETTINGS = {
    "system_name": "TransLink Intercity Bus Express",
    "support_phone": "+251 911 000 111",
    "support_email": "support@translink.com",
    "currency": "ETB",
    "cancellation_policy_hours": "2",
    "seat_selection_enabled": "true",
    "max_seats_per_booking": "4"
}

@report_bp.route('/incidents', methods=['GET'])
@auth_required
def get_incidents():
    return json_response(True, "Incidents retrieved.", INCIDENT_REPORTS)

@report_bp.route('/incidents', methods=['POST'])
@auth_required
@role_required('Admin', 'Driver')
def report_incident():
    from flask import request, g
    data = request.get_json() or {}
    new_inc = {
        "id": len(INCIDENT_REPORTS) + 1,
        "driver_name": g.current_user.get("username", "Driver"),
        "bus_number": data.get("bus_number", "BUS-101"),
        "route": data.get("route", "General Route"),
        "issue_type": data.get("issue_type", "Maintenance Needed"),
        "description": data.get("description", "No description provided"),
        "status": "Reported",
        "reported_at": "Just now"
    }
    INCIDENT_REPORTS.insert(0, new_inc)
    # Also log to audit
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "username": g.current_user.get("username", "Driver"),
        "action": "INCIDENT_REPORTED",
        "details": f"{new_inc['issue_type']}: {new_inc['description'][:50]}",
        "timestamp": "Just now"
    })
    return json_response(True, "Incident reported successfully to administration.", new_inc, status_code=201)

@report_bp.route('/audit-logs', methods=['GET'])
@auth_required
@role_required('Admin')
def get_audit_logs():
    return json_response(True, "Audit logs retrieved.", AUDIT_LOGS)

@report_bp.route('/settings', methods=['GET'])
@auth_required
def get_settings():
    return json_response(True, "System settings retrieved.", SYSTEM_SETTINGS)

@report_bp.route('/settings', methods=['POST'])
@auth_required
@role_required('Admin')
def save_settings():
    from flask import request, g
    data = request.get_json() or {}
    SYSTEM_SETTINGS.update(data)
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "username": g.current_user.get("username", "Admin"),
        "action": "UPDATE_SYSTEM_SETTINGS",
        "details": "Updated transit company configurations",
        "timestamp": "Just now"
    })
    return json_response(True, "System settings updated successfully.", SYSTEM_SETTINGS)

CONTACT_INQUIRIES = [
    {
        "id": "INQ-A82F10",
        "name": "Marta Tefera",
        "email": "marta.tefera@gmail.com",
        "phone": "+251 911 234 567",
        "subject": "Luggage Allowance Inquiry",
        "booking_reference": "TRIP-88201",
        "message": "Can I bring two 25kg suitcases on the Addis Ababa to Bahir Dar morning bus?",
        "status": "Replied",
        "created_at": "2026-10-18 11:20:00"
    }
]

@report_bp.route('/contact', methods=['POST'])
def submit_contact_inquiry():
    from flask import request
    import datetime, secrets
    data = request.get_json() or {}
    name = str(data.get('name') or '').strip()
    email = str(data.get('email') or '').strip()
    message = str(data.get('message') or '').strip()
    subject = str(data.get('subject') or 'General Inquiry').strip()
    phone = str(data.get('phone') or '').strip()
    booking_ref = str(data.get('booking_reference') or '').strip()

    if not name or not email or not message:
        return json_response(False, "Please provide your name, email address, and message.", status_code=400)

    inquiry_id = f"INQ-{secrets.token_hex(3).upper()}"
    inquiry = {
        "id": inquiry_id,
        "name": name,
        "email": email,
        "phone": phone,
        "subject": subject,
        "booking_reference": booking_ref,
        "message": message,
        "status": "Received",
        "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    CONTACT_INQUIRIES.insert(0, inquiry)
    AUDIT_LOGS.insert(0, {
        "id": len(AUDIT_LOGS) + 1,
        "username": email,
        "action": "CONTACT_FORM_SUBMISSION",
        "details": f"Inquiry {inquiry_id}: {subject} from {name}",
        "timestamp": inquiry["created_at"]
    })
    return json_response(True, "Thank you! Your message has been received. Our team will contact you shortly.", inquiry, status_code=201)

@report_bp.route('/contact', methods=['GET'])
@auth_required
@role_required('Admin')
def get_contact_inquiries():
    return json_response(True, "Contact inquiries retrieved.", CONTACT_INQUIRIES)

