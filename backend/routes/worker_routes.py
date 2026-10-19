"""
Worker Management API Routes.
Provides endpoints for Super Admin and Admin users to manage system workers.
- Super Admin: Full CRUD (create/read/update/delete) on Admin and Super Admin accounts.
- Admin: Read-only access to worker list.
"""

from flask import Blueprint, request, g
from backend.models.user import User
from backend.utils.helpers import json_response
from backend.utils.security import auth_required, role_required

worker_bp = Blueprint('worker_bp', __name__)

# Roles considered as "workers" (staff)
WORKER_ROLES = ['Super Admin', 'Admin']


@worker_bp.route('/workers', methods=['GET'])
@auth_required
@role_required('Admin', 'Super Admin')
def get_workers():
    """
    List all worker accounts (Super Admin and Admin users).
    Both Admin and Super Admin can view the worker list.
    """
    search = request.args.get('search', '').strip()
    role_filter = request.args.get('role', '').strip()

    workers = []
    for role in WORKER_ROLES:
        if role_filter and role_filter.lower() != role.lower():
            continue
        users = User.get_all(role=role, search=search if search else None)
        workers.extend(users)

    # Sort by user_id
    workers.sort(key=lambda w: w.get('user_id', 0))

    return json_response(True, "Workers retrieved successfully.", workers)


@worker_bp.route('/workers', methods=['POST'])
@auth_required
@role_required('Super Admin')
def create_worker():
    """
    Create a new worker account (Admin or Super Admin).
    Only Super Admin can create worker accounts.
    """
    data = request.get_json() or {}

    username = str(data.get('username', '')).strip()
    email = str(data.get('email', '')).strip()
    password = str(data.get('password', '')).strip()
    role = str(data.get('role', 'Admin')).strip()
    name = str(data.get('name', '')).strip()

    # Validate required fields
    if not username or not email or not password:
        return json_response(False, "Username, email, and password are required.", status_code=400)

    if len(username) < 3 or len(username) > 50:
        return json_response(False, "Username must be between 3 and 50 characters.", status_code=400)

    if len(password) < 6:
        return json_response(False, "Password must be at least 6 characters.", status_code=400)

    # Validate role
    if role not in WORKER_ROLES:
        return json_response(False, f"Invalid role. Must be one of: {', '.join(WORKER_ROLES)}.", status_code=400)

    # Validate email format
    from backend.utils.validators import validate_email
    valid_email, email_err = validate_email(email)
    if not valid_email:
        return json_response(False, email_err, status_code=400)

    # Check if username or email already exists
    existing = User.get_by_username_or_email(username)
    if existing:
        return json_response(False, "Username is already taken.", status_code=400)

    existing_email = User.get_by_username_or_email(email)
    if existing_email:
        return json_response(False, "Email is already registered.", status_code=400)

    # Create the worker user account
    user_id = User.create(
        username=username,
        email=email,
        password=password,
        role=role
    )

    # Audit log
    try:
        import datetime
        from backend.routes.report_routes import AUDIT_LOGS
        AUDIT_LOGS.insert(0, {
            "id": len(AUDIT_LOGS) + 1,
            "username": g.current_user.get("username", "Super Admin"),
            "action": "WORKER_CREATED",
            "details": f"Created {role} worker '{username}' (ID #{user_id})",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
    except Exception:
        pass

    return json_response(True, f"{role} worker '{username}' created successfully.", {
        "user_id": user_id,
        "username": username,
        "email": email,
        "role": role,
        "status": "Active"
    }, status_code=201)


@worker_bp.route('/workers/<int:user_id>', methods=['PUT'])
@auth_required
@role_required('Super Admin')
def update_worker(user_id):
    """
    Update a worker account (role, status, email, username).
    Only Super Admin can update worker accounts.
    """
    data = request.get_json() or {}

    user = User.get_by_id(user_id)
    if not user:
        return json_response(False, "Worker not found.", status_code=404)

    # Only allow editing worker roles
    if user['role'] not in WORKER_ROLES:
        return json_response(False, "This user is not a worker account.", status_code=400)

    # Prevent Super Admin from demoting themselves
    if user_id == g.current_user.get('user_id') and data.get('role') and data['role'] != user['role']:
        return json_response(False, "You cannot change your own role.", status_code=400)

    email = data.get('email', '').strip()
    username = data.get('username', '').strip()
    new_role = data.get('role', '').strip()
    new_status = data.get('status', '').strip()

    # Update profile fields
    if email or username:
        User.update_profile(user_id, email=email if email else None, username=username if username else None)

    # Update role if changed
    if new_role and new_role in WORKER_ROLES and new_role != user['role']:
        from backend.database.connection import execute_query
        execute_query("UPDATE users SET role = %s WHERE user_id = %s", (new_role, user_id), commit=True)

    # Update status if changed
    if new_status and new_status in ['Active', 'Inactive']:
        from backend.database.connection import execute_query
        execute_query("UPDATE users SET status = %s WHERE user_id = %s", (new_status, user_id), commit=True)

    # Update password if provided
    new_password = data.get('password', '').strip()
    if new_password:
        if len(new_password) < 6:
            return json_response(False, "Password must be at least 6 characters.", status_code=400)
        User.update_password(user_id, new_password)

    # Audit log
    try:
        import datetime
        from backend.routes.report_routes import AUDIT_LOGS
        AUDIT_LOGS.insert(0, {
            "id": len(AUDIT_LOGS) + 1,
            "username": g.current_user.get("username", "Super Admin"),
            "action": "WORKER_UPDATED",
            "details": f"Updated worker '{user['username']}' (ID #{user_id})",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
    except Exception:
        pass

    return json_response(True, f"Worker '{user['username']}' updated successfully.", {
        "user_id": user_id,
        "username": username or user['username'],
        "email": email or user['email'],
        "role": new_role or user['role'],
        "status": new_status or user['status']
    })


@worker_bp.route('/workers/<int:user_id>', methods=['DELETE'])
@auth_required
@role_required('Super Admin')
def deactivate_worker(user_id):
    """
    Deactivate (soft delete) a worker account.
    Only Super Admin can deactivate workers.
    Prevents self-deactivation.
    """
    if user_id == g.current_user.get('user_id'):
        return json_response(False, "You cannot deactivate your own account.", status_code=400)

    user = User.get_by_id(user_id)
    if not user:
        return json_response(False, "Worker not found.", status_code=404)

    if user['role'] not in WORKER_ROLES:
        return json_response(False, "This user is not a worker account.", status_code=400)

    from backend.database.connection import execute_query
    execute_query("UPDATE users SET status = 'Inactive' WHERE user_id = %s", (user_id,), commit=True)

    # Audit log
    try:
        import datetime
        from backend.routes.report_routes import AUDIT_LOGS
        AUDIT_LOGS.insert(0, {
            "id": len(AUDIT_LOGS) + 1,
            "username": g.current_user.get("username", "Super Admin"),
            "action": "WORKER_DEACTIVATED",
            "details": f"Deactivated worker '{user['username']}' (ID #{user_id}, {user['role']})",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
    except Exception:
        pass

    return json_response(True, f"Worker '{user['username']}' has been deactivated.")


@worker_bp.route('/workers/<int:user_id>/activate', methods=['PUT'])
@auth_required
@role_required('Super Admin')
def activate_worker(user_id):
    """
    Re-activate a deactivated worker account.
    """
    user = User.get_by_id(user_id)
    if not user:
        return json_response(False, "Worker not found.", status_code=404)

    if user['role'] not in WORKER_ROLES:
        return json_response(False, "This user is not a worker account.", status_code=400)

    from backend.database.connection import execute_query
    execute_query("UPDATE users SET status = 'Active' WHERE user_id = %s", (user_id,), commit=True)

    return json_response(True, f"Worker '{user['username']}' has been re-activated.")
