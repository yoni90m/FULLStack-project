import os
import secrets
import re
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

    # PostgreSQL Configuration
    DATABASE_URL = os.getenv('DATABASE_URL')
    if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 5432))
    DB_NAME = os.getenv('DB_NAME', 'bus_transportation')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'Yo08541633&')

    # Security settings
    JWT_EXPIRY_HOURS = int(os.getenv('JWT_EXPIRY_HOURS', 24))
    RATE_LIMIT_DEFAULT = os.getenv('RATE_LIMIT_DEFAULT', '100 per hour')
    RATE_LIMIT_AUTH = os.getenv('RATE_LIMIT_AUTH', '10 per minute')

    # Allowed origins: local dev + cloud deployment domains
    FRONTEND_URL = os.getenv('FRONTEND_URL')
    ALLOWED_ORIGINS = [
        re.compile(r'^https?://(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$'),
        re.compile(r'^https?://.*\.onrender\.com$'),
        re.compile(r'^https?://.*\.vercel\.app$'),
        re.compile(r'^https?://.*\.railway\.app$'),
    ]
    if FRONTEND_URL:
        ALLOWED_ORIGINS.append(FRONTEND_URL)
