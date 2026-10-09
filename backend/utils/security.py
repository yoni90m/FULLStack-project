"""
Security Middleware — JWT Authentication & Role-Based Access Control (RBAC).
Provides decorators for protecting API endpoints with proper token validation.
"""

import jwt
import datetime
from functools import wraps
from flask import request, g
from backend.config import Config


def generate_token(user_data, expires_hours=24):
    """
    Generate a secure JWT token for an authenticated user.

    Args:
        user_data: Dict containing user_id, username, email, role.
        expires_hours: Token validity period in hours (default 24h).

    Returns:
        Encoded JWT token string.
    """
    payload = {
        "user_id": user_data.get("user_id"),
        "username": user_data.get("username", "admin"),
        "email": user_data.get("email", "admin@translink.com"),
        "role": user_data.get("role", "admin"),
        "iat": datetime.datetime.now(datetime.timezone.utc),
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=expires_hours),
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")


def decode_token(token):
    """
    Decode and validate a JWT token.

    Returns:
        Decoded payload dict on success, None on failure.
    """
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def auth_required(f):
    """
    Decorator — Requires a valid JWT token in the Authorization header.
    Sets `g.current_user` with the decoded token payload for downstream use.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization", "")

        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1]

        if not token:
            return {"success": False, "message": "Authentication required. Please provide a valid token."}, 401

        payload = decode_token(token)
        if not payload:
            return {"success": False, "message": "Token is invalid or expired. Please log in again."}, 401

        g.current_user = payload
        return f(*args, **kwargs)

    return decorated


def role_required(*allowed_roles):
    """
    Decorator — Requires the authenticated user to have one of the specified roles.
    Must be used AFTER @auth_required.

    Usage:
        @auth_required
        @role_required('Admin')
        def admin_only_route():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = getattr(g, "current_user", None)
            if not user:
                return {"success": False, "message": "Authentication required."}, 401

            user_role = str(user.get("role", "")).strip().lower()
            allowed_lower = [str(r).strip().lower() for r in allowed_roles]
            if user_role not in allowed_lower:
                return {
                    "success": False,
                    "message": f"Access denied. Required role: {', '.join(allowed_roles)}."
                }, 403

            return f(*args, **kwargs)
        return decorated
    return decorator
