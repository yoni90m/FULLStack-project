from flask import request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from backend.config import Config

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[getattr(Config, 'RATE_LIMIT_DEFAULT', '100 per hour')],
    storage_uri="memory://",
    strategy="fixed-window"
)

@limiter.request_filter
def exempt_preflight_and_static():
    """Exempt CORS preflight OPTIONS requests and static files from rate limits."""
    if request.method == "OPTIONS":
        return True
    if not request.path.startswith("/api/"):
        return True
    return False
