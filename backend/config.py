import os
import secrets
from pathlib import Path
from dotenv import load_dotenv

# Locate and load the root .env file
root_dir = Path(__file__).resolve().parent.parent
env_path = root_dir / '.env'
load_dotenv(dotenv_path=env_path)

class Config:
    """Base application configuration."""
    # Generate a cryptographically random fallback if no SECRET_KEY is set
    SECRET_KEY = os.getenv('SECRET_KEY') or secrets.token_hex(32)
    FLASK_ENV = os.getenv('FLASK_ENV', 'production')
    DEBUG = FLASK_ENV == 'development'

    # Database configuration — SQLite3
    DB_SQLITE_PATH = os.getenv('DB_SQLITE_PATH', str(root_dir / 'database' / 'bus_transportation.sqlite3'))

    # Security settings
    JWT_EXPIRY_HOURS = int(os.getenv('JWT_EXPIRY_HOURS', 24))
    RATE_LIMIT_DEFAULT = os.getenv('RATE_LIMIT_DEFAULT', '100 per hour')
    RATE_LIMIT_AUTH = os.getenv('RATE_LIMIT_AUTH', '10 per minute')
    ALLOWED_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            'ALLOWED_ORIGINS',
            'http://localhost:5173,http://localhost:5000,http://127.0.0.1:5173,http://127.0.0.1:5000'
        ).split(',')
        if origin.strip()
    ]
