# System Requirements & Architecture Specification

## 1. Non-Functional Requirements
- **Performance**: Response time under 200ms for API queries.
- **Security**: Passwords hashed using Werkzeug `pbkdf2:sha256` / `scrypt`. SQL parameters sanitized to prevent SQL injection.
- **Usability**: Fully responsive across Desktop, Tablet, and Mobile viewports with touch-friendly controls.
- **Reliability**: Dual-mode API client fallback ensures 100% UI interactivity even when offline.

## 2. Business Rules
1. No bus or driver can be scheduled for two overlapping trips simultaneously.
2. Origin and destination cities cannot be identical.
3. Seat numbers follow standard 4-seat coach rows (`1A`, `1B`, aisle, `1C`, `1D`).
4. Cancelling a booking restores seat availability in the corresponding schedule.
