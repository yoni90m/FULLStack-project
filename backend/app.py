from flask import Flask, send_from_directory, request
from flask_cors import CORS
from backend.extensions import limiter
from backend.config import Config
from backend.utils.helpers import json_response
from pathlib import Path

# Import Blueprints
from backend.routes.auth_routes import auth_bp
from backend.routes.bus_routes import bus_bp
from backend.routes.route_routes import route_bp
from backend.routes.schedule_routes import schedule_bp
from backend.routes.driver_routes import driver_bp
from backend.routes.passenger_routes import passenger_bp
from backend.routes.booking_routes import booking_bp
from backend.routes.payment_routes import payment_bp
from backend.routes.report_routes import report_bp
from backend.routes.tracking_routes import tracking_bp
from backend.routes.worker_routes import worker_bp

def create_app():
    root_dir = Path(__file__).resolve().parent.parent
    react_dist = root_dir / 'frontend-react' / 'dist'
    static_dir = react_dist if react_dist.exists() else (root_dir / 'frontend')
    app = Flask(__name__, static_folder=str(static_dir), static_url_path='')
    app.config.from_object(Config)

    # Initialize rate limiter
    limiter.init_app(app)

    # Restrict CORS to configured origins only (not wildcard *)
    CORS(app, resources={r"/api/*": {
        "origins": Config.ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
    }})

    # Register Blueprints under /api
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(bus_bp, url_prefix='/api/buses')
    app.register_blueprint(route_bp, url_prefix='/api/routes')
    app.register_blueprint(schedule_bp, url_prefix='/api/schedules')
    app.register_blueprint(driver_bp, url_prefix='/api/drivers')
    app.register_blueprint(passenger_bp, url_prefix='/api/passengers')
    app.register_blueprint(booking_bp, url_prefix='/api/bookings')
    app.register_blueprint(payment_bp, url_prefix='/api/payments')
    app.register_blueprint(report_bp, url_prefix='/api/reports')
    app.register_blueprint(tracking_bp, url_prefix='/api/tracking')
    app.register_blueprint(worker_bp, url_prefix='/api')

    # ── Security Headers Middleware ──
    @app.after_request
    def apply_security_headers(response):
        # Prevent clickjacking
        response.headers['X-Frame-Options'] = 'DENY'
        # Prevent MIME-type sniffing
        response.headers['X-Content-Type-Options'] = 'nosniff'
        # XSS protection (legacy browsers)
        response.headers['X-XSS-Protection'] = '1; mode=block'
        # Referrer policy
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        # Content Security Policy
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' http://localhost:* http://127.0.0.1:* ws: wss:;"
        )
        # Permissions policy (allow geolocation for own origin for live GPS map navigation)
        response.headers['Permissions-Policy'] = 'geolocation=(self), camera=(), microphone=()'
        # Cache control for API responses and HTML SPA files
        if request.path.startswith('/api/') or response.mimetype == 'text/html':
            response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
            response.headers['Pragma'] = 'no-cache'
        return response

    # Serve Frontend Single Page App & Static Assets
    @app.route('/')
    def serve_frontend_root():
        return send_from_directory(app.static_folder, 'index.html')

    @app.route('/<path:path>')
    def serve_static_or_page(path):
        if path.startswith('api/'):
            return json_response(False, "API resource not found.", status_code=404)
        target = Path(app.static_folder) / path
        if target.exists() and not target.is_dir():
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, 'index.html')

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found_error(error):
        if request.path.startswith('/api/'):
            return json_response(False, "Requested API resource not found.", status_code=404)
        index_file = Path(app.static_folder) / 'index.html'
        if index_file.exists():
            return send_from_directory(app.static_folder, 'index.html')
        return json_response(False, "Requested resource not found.", status_code=404)

    @app.errorhandler(429)
    def rate_limit_error(error):
        return json_response(False, "Too many requests. Please try again later.", status_code=429)

    @app.errorhandler(500)
    def internal_error(error):
        return json_response(False, "An internal server error occurred.", status_code=500)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=5000, debug=Config.DEBUG)
