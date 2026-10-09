import urllib.request
import json
import sys

base = 'http://127.0.0.1:5000/api'
endpoints = [
    '/buses',
    '/routes',
    '/schedules',
    '/drivers',
    '/passengers',
    '/bookings',
    '/payments',
    '/reports/stats'
]

print("=" * 60)
print("Testing Live REST API Endpoints on http://127.0.0.1:5000/api")
print("=" * 60)

all_passed = True
for ep in endpoints:
    url = base + ep
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            items = len(data.get('data', [])) if isinstance(data.get('data'), list) else 'object'
            print(f"PASS: {ep:<16} Status {resp.status} | success={data.get('success')} | payload={items}")
    except Exception as e:
        print(f"FAIL: {ep:<16} Error: {e}")
        all_passed = False

# Test Authentication
print("-" * 60)
print("Testing Live Authentication:")
try:
    login_data = json.dumps({'username': 'admin', 'password': 'admin123'}).encode('utf-8')
    login_req = urllib.request.Request(
        base + '/auth/login',
        data=login_data,
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(login_req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        user = data.get('data', {})
        print(f"PASS: /auth/login     Status {resp.status} | Logged in as: {user.get('username')} ({user.get('role')})")
except Exception as e:
    print(f"FAIL: /auth/login     Error: {e}")
    all_passed = False

# Test Static Frontend Serving
print("-" * 60)
print("Testing Static Frontend Serving:")
try:
    with urllib.request.urlopen('http://127.0.0.1:5000/') as resp:
        html = resp.read().decode('utf-8')
        has_title = '<title>TransLink' in html
        print(f"PASS: Root (/)        Status {resp.status} | TransLink HTML Served: {has_title}")
except Exception as e:
    print(f"FAIL: Root (/)        Error: {e}")
    all_passed = False

print("=" * 60)
if all_passed:
    print("ALL LIVE END-TO-END TESTS PASSED SUCCESSFULLY!")
else:
    print("SOME TESTS FAILED.")
sys.exit(0 if all_passed else 1)
