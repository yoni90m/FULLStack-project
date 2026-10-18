from flask import Blueprint, request, g
from backend.services.auth_service import AuthService
from backend.utils.helpers import json_response
from backend.utils.security import auth_required
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
