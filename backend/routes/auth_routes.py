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
