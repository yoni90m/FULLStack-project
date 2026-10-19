#!/usr/bin/env bash
# Exit on error
set -o errexit

# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Build React Frontend
cd frontend-react
npm install
npm run build
cd ..

# 3. Initialize PostgreSQL Database Schema & Seed Data
python -c "from backend.database.connection import _init_postgres_db; _init_postgres_db()"
