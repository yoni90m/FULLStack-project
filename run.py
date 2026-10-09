#!/usr/bin/env python3
"""
TransLink Bus Transportation Management System
Entry point to launch the Flask REST API server and static web server.
"""

import sys
import io

# Ensure UTF-8 output on Windows consoles
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from backend.app import create_app
from backend.config import Config

app = create_app()

if __name__ == '__main__':
    print("=" * 65)
    print(" [TransLink] Bus Transportation Management System")
    print(" Server running at: http://127.0.0.1:5000")
    print(" REST API Base URL:  http://127.0.0.1:5000/api")
    print("=" * 65)
    app.run(host='127.0.0.1', port=5000, debug=Config.DEBUG, use_reloader=False)
