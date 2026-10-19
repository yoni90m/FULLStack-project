from flask import Blueprint, request, g
from backend.services.auth_service import AuthService
from backend.utils.helpers import json_response
from backend.utils.security import auth_required, role_required
from backend.extensions import limiter

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.get_json() or {}
    success, message, result = AuthService.register(data)
    if not success:
        return json_response(False, message, status_code=400)
    return json_response(True, message, result, status_code=201)

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.get_json() or {}
    success, message, result = AuthService.login(data)
    if not success:
        return json_response(False, message, status_code=401)
    return json_response(True, message, result, status_code=200)

@auth_bp.route('/logout', methods=['POST'])
@auth_required
def logout():
    # In a production system, you would add the token to a blacklist/revocation list here
    return json_response(True, "Logged out successfully.")

@auth_bp.route('/me', methods=['GET'])
@auth_required
def me():
    """Returns the current authenticated user's profile from the JWT token."""
    user = g.current_user
    return json_response(True, "Current user profile", {
        "user_id": user["user_id"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"]
    })

@auth_bp.route('/profile', methods=['PUT'])
@auth_required
def update_profile():
    data = request.get_json() or {}
    user_id = g.current_user["user_id"]
    from backend.models.user import User
    
    email = data.get("email")
    username = data.get("username")
    
    if email:
        from backend.utils.validators import validate_email
        valid, err = validate_email(email)
        if not valid:
            return json_response(False, err, status_code=400)
            
    success = User.update_profile(user_id, email=email, username=username)
    if not success:
        return json_response(False, "Failed to update profile or no changes provided.", status_code=400)
        
    return json_response(True, "Profile updated successfully.", {
        "user_id": user_id,
        "username": username or g.current_user["username"],
        "email": email or g.current_user["email"]
    })

@auth_bp.route('/change-password', methods=['PUT'])
@auth_required
def change_password():
    data = request.get_json() or {}
    old_password = data.get("old_password", "")
    new_password = data.get("new_password", "")
    
    if not old_password or not new_password:
        return json_response(False, "Please provide both old and new passwords.", status_code=400)
        
    if len(new_password) < 6:
        return json_response(False, "New password must be at least 6 characters long.", status_code=400)
        
    from backend.models.user import User
    user = User.get_by_id(g.current_user["user_id"])
    if not user:
        return json_response(False, "User not found.", status_code=404)
        
    # Verify old password
    user_with_pw = User.get_by_username_or_email(user["username"])
    if not User.verify_password(user_with_pw["password"], old_password):
        return json_response(False, "Current password is incorrect.", status_code=400)
        
    User.update_password(user["user_id"], new_password)
    return json_response(True, "Password changed successfully.")

@auth_bp.route('/users', methods=['GET'])
@auth_required
@role_required('Admin')
def get_all_users():
    """Admin-only: Retrieve all registered users across all roles (Passenger, Driver, Admin)."""
    role = request.args.get('role')
    search = request.args.get('search')
    from backend.models.user import User
    users = User.get_all(role=role, search=search)
    return json_response(True, "Users retrieved successfully.", users)

@auth_bp.route('/admin/reset-password', methods=['POST'])
@auth_bp.route('/reset-password', methods=['POST'])
@auth_required
@role_required('Admin')
def admin_reset_password():
    """
    Admin-only: Reset password for any user who lost or forgot their credentials.
    Accepts user_id or identifier (username/email), with optional custom new_password.
    If no new_password provided, generates a secure memorable temporary password.
    """
    data = request.get_json() or {}
    user_id = data.get('user_id')
    identifier = data.get('identifier') or data.get('username') or data.get('email')
    new_password = str(data.get('new_password') or '').strip()

    from backend.models.user import User
    user = None
    if user_id is not None:
        try:
            user = User.get_by_id(int(user_id))
        except (ValueError, TypeError):
            user = None

    if not user and identifier:
        user = User.get_by_username_or_email(str(identifier).strip())

    if not user:
        return json_response(False, "User account not found. Please provide a valid user ID, username, or email.", status_code=404)

    # If new_password not provided, auto-generate a secure temporary password
    if not new_password:
        import secrets
        rand_code = secrets.randbelow(9000) + 1000
        new_password = f"TransLink#{rand_code}"
    else:
        if len(new_password) < 6:
            return json_response(False, "New password must be at least 6 characters long.", status_code=400)

    # Perform password update
    target_user_id = user['user_id']
    User.update_password(target_user_id, new_password)

    # Audit log
    try:
        import datetime
        from backend.routes.report_routes import AUDIT_LOGS
        AUDIT_LOGS.insert(0, {
            "id": len(AUDIT_LOGS) + 1,
            "username": g.current_user.get("username", "Admin"),
            "action": "ADMIN_PASSWORD_RESET",
            "details": f"Admin reset password for user '{user['username']}' (ID #{target_user_id}, {user['role']})",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        })
    except Exception:
        pass

    return json_response(True, f"Password for {user['username']} has been successfully reset.", {
        "user_id": target_user_id,
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "new_password": new_password
    })

