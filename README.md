# Campus Mess Booking

![Campus Mess Booking](https://img.shields.io/badge/Bennett%20University-campus%20dining-0f766e)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-16a34a)
![React](https://img.shields.io/badge/React-19-149eca)
![MongoDB](https://img.shields.io/badge/MongoDB-replica%20set-47a248)

A production-minded meal reservation system for Bennett University. Students reserve a dated meal slot and receive a recoverable QR pass; mess staff manage capacity and scan entry; administrators manage enrollment and reporting.

The application is designed around the rules that matter at a busy mess: one active reservation per meal, no overbooking under concurrent requests, India Standard Time cutoffs, and auditable changes.

## What it includes

- Student booking for breakfast, lunch, snacks, and dinner with floor-aware availability.
- Recoverable QR passes with owner-only access and one-time gate redemption.
- Cancellation and atomic rescheduling before the 15-minute cutoff.
- Admin enrollment, bulk import, floor/access management, dated slot inventory, and CSV reports.
- Daily and seven-day analytics with reservation, consumption, and unique-student totals.
- Responsive student and admin interfaces, dark mode, loading/retry states, and mobile-friendly navigation.
- Transactional MongoDB services, versioned JWT sessions, password hashing, request validation, rate limits, audit logs, and safe error responses.

## Quick links

- [Local setup](#local-setup)
- [Architecture](#architecture)
- [Business rules](#business-rules)
- [API overview](#api-overview)
- [Testing](#testing)
- [Production rollout](#production-rollout)

## Project layout

- `frontend/src/pages`: admin screens and login.
- `frontend/src/student`: student dashboard.
- `frontend/src/components`: shared layout, feedback, pagination and QR dialog.
- `frontend/src/services`: API, session and display helpers.
- `backend/routes`: HTTP contracts and authorization.
- `backend/services`: transactional booking, authentication and reporting.
- `backend/lib/domain.js`: campus dates, cutoffs and request validation.
- `backend/models`: indexed records and booking snapshots.
- `backend/tests`: unit and isolated MongoDB integration tests.
- `backend/scripts`: provisioning and read-only legacy audit.

The duplicate application in `backend/admin-dashboard` is retired. Its earlier implementation remains in Git history.

## Architecture

```text
React + Vite frontend
        │ /api (same-origin proxy or HTTPS API URL)
        ▼
Express API ── authentication, validation, rate limits, audit logging
        │
        ▼
MongoDB replica set ── indexed slots, bookings, users, and transactions
```

The backend is split into route, service, model, and domain layers. Booking state changes live in services so capacity updates and booking records commit together. The frontend is one Vite application with separate student and administrator routes.

## Requirements

Node.js 22.12+ and MongoDB Atlas or a MongoDB replica set. Standalone MongoDB is intentionally rejected: booking, cancellation and rescheduling require transactions. All meal dates and windows use **Asia/Kolkata (UTC+05:30)**; the server's operating-system timezone does not change the business day.

## Local setup

1. Run `npm ci --prefix backend` and `npm ci --prefix frontend`.
2. Copy `backend/.env.example` to `backend/.env`; set your MongoDB URI and a random JWT secret of at least 32 characters. Generate a secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
3. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in that local environment, then run `node backend/createAdmin.js`. Passwords must contain at least 12 characters and at most 72 UTF-8 bytes. Existing administrators are left untouched.
4. Run `npm run seed:slots --prefix backend` to create seven days of default slots. To choose dates: `npm run seed:slots --prefix backend -- 2026-09-14 7`. Re-running preserves existing slots and reservations.
5. Run `npm run dev --prefix backend` and `npm run dev --prefix frontend` in separate terminals.
6. Open the frontend URL printed by Vite. The default local API proxy points to localhost:5000. Sign in as admin to enroll students.

The student email local part maps to an administrator-enrolled roll number. This is **not university SSO or proof of email ownership**. Public student signup is disabled.

No fixed demo password is shipped. Optional demo enrollment requires a separate non-production database, `ALLOW_DEMO_SEED=true`, and `DEMO_STUDENT_PASSWORD`; then run `node backend/scripts/seedDemoStudent.js`.

## Configuration

Copy the example files before starting:

- [`backend/.env.example`](backend/.env.example) — MongoDB, JWT, CORS, and provisioning settings.
- [`frontend/.env.example`](frontend/.env.example) — optional `VITE_API_URL` for a separately hosted API.

Keep secrets in the server environment. Never put database credentials or `JWT_SECRET` in a `VITE_` variable or commit a `.env` file.

## Business rules

- Each date/floor/meal/start-time combination has independent capacity.
- A student may hold one active reservation per meal per campus day. Consumed bookings still prevent a second reservation for that meal.
- Booking, cancellation and rescheduling close exactly 15 minutes before the slot starts.
- The earliest available eligible slot is assigned unless the student chooses a specific time.
- Rescheduling is atomic: if the replacement cannot be booked, the old reservation remains.
- Gate entry requires an authenticated administrator, an unused active pass for today, and a time within `[startAt, endAt)`.
- QR tokens are random, are excluded from list endpoints, and can be rendered again only by the booking owner.
- Student and slot records are retained. Students with upcoming unused passes cannot be deactivated or moved to a different floor until those bookings are cancelled. Slots with reservations cannot be closed or reduced below their reserved count.
- Administrative student/slot mutations have audit records; successful scans record operator and timestamp.
- Accounts use expiring JWTs with a version counter. Password resets and student access changes revoke previous sessions. Browser sessions default to sessionStorage; “Keep me signed in” uses localStorage. This remains bearer-token authentication; protect the frontend from XSS.

## API overview

Base path: `/api`. Protected endpoints require `Authorization: Bearer <token>`.

| Method and path                         | Access             | Purpose                                             |
| --------------------------------------- | ------------------ | --------------------------------------------------- |
| POST /admin/login                       | Public, throttled  | Admin login                                         |
| POST /students/auth/login               | Public, throttled  | Student login with rollNo/password                  |
| POST /admin/register                    | Admin              | Provision another administrator                     |
| GET /admin/me                           | Admin              | Current admin                                       |
| GET /students/profile                   | Student            | Current student                                     |
| PUT /admin/password, /students/password | Respective account | currentPassword/newPassword; re-login required      |
| GET /slots/today                        | Student            | Today's slots for assigned floor, with availability |
| POST /bookings/create                   | Student            | mealType and optional slotId                        |
| GET /bookings/my                        | Student            | Paginated owned history                             |
| GET /bookings/today                     | Student            | Active owned bookings for today                     |
| GET /bookings/:id/qr                    | Owner              | Re-render valid pass                                |
| POST /bookings/:id/cancel               | Owner              | Cancel before cutoff                                |
| POST /bookings/:id/reschedule           | Owner              | Atomic move; body slotId                            |
| POST /bookings/scan                     | Admin              | Redeem body qrCode                                  |
| GET /admin/bookings                     | Admin              | page/limit/date/mealType/status filters             |
| GET /admin/students                     | Admin              | page/limit/search                                   |
| POST /admin/students                    | Admin              | rollNo/name/hostel/floor/password                   |
| POST /admin/students/import             | Admin              | students array; up to 100, atomic                   |
| PUT /admin/students/:id/floor           | Admin              | floor                                               |
| PUT /admin/students/:id/active          | Admin              | active boolean                                      |
| PUT /admin/students/:id/password        | Admin              | password; revoke sessions                           |
| GET /admin/slots                        | Admin              | date/page/limit                                     |
| POST /admin/slots                       | Admin              | mealType/floor/date/startTime/endTime/capacity      |
| PUT /admin/slots/:id                    | Admin              | capacity/active                                     |
| GET /admin/analytics/daily              | Admin              | date; meals and unique student count                |
| GET /admin/analytics/weekly             | Admin              | date; seven days ending on selected date            |
| GET /admin/reports                      | Admin              | date-specific streamed, escaped CSV                 |
| GET /health                             | Public             | 200 ready, 503 database unavailable (outside /api)  |

Paginated responses are `{ items, total, page, limit }`, with default limit 25 and maximum 100. Errors are `{ error, requestId }`. Invalid input returns 400, expired sessions 401, missing records 404, conflicts 409, and throttled requests 429.

## Testing

```sh
npm test --prefix backend
npm test --prefix frontend
npm run lint --prefix frontend
npm run build --prefix frontend
npm run format:check --prefix frontend
```

Backend tests start and stop their own temporary MongoDB replica set. They never load `backend/.env` or connect to the configured application database. The first test/install run needs internet access to download a MongoDB binary; later runs use the cached binary. Tests cover concurrency, rollback, duplicate prevention, next-day capacity, QR ownership/recovery/redemption, cancellation/rescheduling, account resets, imports, CSV and timezone boundaries.

CI runs these checks on every push and pull request. Recheck dependency advisories with `npm audit` in both supported packages.

The integration suite starts an isolated MongoDB replica set, exercises concurrent booking and scanning, and shuts it down automatically. It does not connect to your configured database.

## Production rollout

For a new deployment, build `frontend/dist`, serve `index.html` for client routes, and proxy `/api` and `/health` to the API. Set `NODE_ENV=production`, exact `CORS_ORIGINS`, a random `JWT_SECRET` of at least 32 characters, and an Atlas or replica-set MongoDB URI. Use HTTPS, backups, monitoring, and a shared rate limiter before running multiple API instances.

## Existing installations: read before rollout

1. Take a database backup and verify restoration in a separate environment.
2. Schedule the rollout after outstanding meal windows close. Old QR payloads and old JWTs are intentionally not accepted by the new flow.
3. Run `npm run audit:legacy --prefix backend`. It reports undated slots and older bookings without modifying documents. The script connects through the normal startup routine, which may create additive indexes.
4. Old bookings remain in history and date reports as archived records. Their ambiguous original timezone cannot be reconstructed reliably; check historical report interpretation against the old server's timezone. Their slots are never reused as current daily capacity.
5. Seed new dated slots. Existing student/admin IDs and password hashes are preserved. Administrators affected by the former double-hashing bug must use `node backend/resetAdminPassword.js` with the intended username/new password in the local environment.
6. Startup creates additive indexes and fails if it cannot establish constraints. It never drops or automatically repairs records. Investigate conflicts before restarting.
7. Deploy frontend and backend together because several API response shapes and endpoints changed. Every user signs in again.

## Deployment and operations

Build `frontend/dist` and configure the host to serve `index.html` for client routes. Proxy `/api` and `/health` to the API, or set `VITE_API_URL=https://your-api.example/api` **at frontend build time**. Never place database credentials or JWT secrets in VITE_ variables.

Set `NODE_ENV=production`, `CORS_ORIGINS` to exact permitted frontend origins, a strong `JWT_SECRET`, and your Atlas/replica-set URI. Configure `TRUST_PROXY_HOPS` only to the exact trusted proxy count; do not blindly trust forwarded IP headers. Use HTTPS for sessions and camera access.

The built-in login/scan throttling is process-local. Use a shared limiter or edge rate limiting before scaling to multiple API instances. Store secrets in the hosting secret manager, restrict database network access, monitor readiness and request IDs, and configure regular backups with periodic restore drills. Re-run slot seeding on a schedule or create upcoming slots through the admin UI.

The backend handles SIGTERM/SIGINT with graceful HTTP/database shutdown. The frontend retries failed reads on request and refreshes current booking/analytics data every 30 seconds.
