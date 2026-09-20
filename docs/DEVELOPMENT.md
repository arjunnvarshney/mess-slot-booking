# Developer guide

[Back to the project overview](../README.md)

## Technology stack

| Layer                    | Technologies                                                                 |
| ------------------------ | ---------------------------------------------------------------------------- |
| Interface                | React 19, React Router, CSS                                                  |
| Development and bundling | Vite with the Rolldown implementation                                        |
| Charts and QR scanning   | Recharts, html5-qrcode                                                       |
| API                      | Node.js, Express 5                                                           |
| Database                 | MongoDB replica set or Atlas, Mongoose                                       |
| Authentication           | JWT, bcrypt password hashing                                                 |
| Verification             | Node.js test runner, mongodb-memory-server, ESLint, Prettier, GitHub Actions |

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

### 1. Clone and install

```sh
git clone https://github.com/arjunnvarshney/mess-slot-booking.git
cd mess-slot-booking
npm ci --prefix backend
npm ci --prefix frontend
```

Run the remaining commands from the repository root. If you already have a checkout, use that folder instead of cloning again.

### 2. Configure the API

Copy `backend/.env.example` to `backend/.env` using your editor or file manager. Set `MONGO_URI` to your Atlas connection string or a configured local replica set. Set `JWT_SECRET` to a random value of at least 32 characters; generate one with:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

The example MongoDB URI assumes a replica set named `rs0` already exists. Copying it does not create a database server or configure replication.

### 3. Create the first administrator

Add `ADMIN_USERNAME` and `ADMIN_PASSWORD` to `backend/.env`, then run:

```sh
node backend/createAdmin.js
```

Passwords must contain at least 12 characters and at most 72 UTF-8 bytes. The script leaves existing administrators untouched. Remove the provisioning password from the environment file after account creation.

### 4. Create meal slots

```sh
npm run seed:slots --prefix backend
```

This creates seven days of dated slots beginning today. Re-running preserves existing capacities and reservations. Optional arguments accept a current or future `YYYY-MM-DD` start date followed by a day count from 1 to 31.

The default seed creates 15-minute slots on floors 1 and 2 with capacity 120 per slot:

| Meal      | Service window (IST) |
| --------- | -------------------- |
| Breakfast | 07:30–09:30          |
| Lunch     | 12:00–15:00          |
| Snacks    | 17:00–18:00          |
| Dinner    | 20:00–22:00          |

These are application defaults; review them against your mess schedule before use.

### 5. Start the application

In one terminal:

```sh
npm run dev --prefix backend
```

In another terminal:

```sh
npm run dev --prefix frontend
```

Open the URL printed by Vite, normally `http://localhost:5173`. The local `/api` proxy targets port `5000`. Choose **Administrator sign in**, enroll a student, then use that student's account to try a booking. Database readiness is available at `http://localhost:5000/health`.

The student email local part maps to an administrator-enrolled roll number. This is **not university SSO or proof of email ownership**. Public student signup is disabled.

No fixed demo password is shipped. Optional demo enrollment requires a separate non-production database, `ALLOW_DEMO_SEED=true`, and `DEMO_STUDENT_PASSWORD`; then run `node backend/scripts/seedDemoStudent.js`.

## Configuration

| Variable                           | Location                | Purpose                                                              |
| ---------------------------------- | ----------------------- | -------------------------------------------------------------------- |
| `MONGO_URI`                        | Backend                 | Atlas or replica-set connection string                               |
| `JWT_SECRET`                       | Backend                 | Random signing secret, at least 32 characters                        |
| `PORT`                             | Backend                 | API port; defaults to `5000`                                         |
| `CORS_ORIGINS`                     | Backend                 | Comma-separated exact frontend origins                               |
| `NODE_ENV`                         | Backend                 | Set to `production` for deployment                                   |
| `TRUST_PROXY_HOPS`                 | Backend                 | Optional number of trusted reverse proxy hops                        |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | Backend scripts         | Administrator provisioning or password reset                         |
| `VITE_API_URL`                     | Frontend, at build time | Optional separate API URL ending in `/api`; otherwise `/api` is used |

See [`backend/.env.example`](../backend/.env.example) and [`frontend/.env.example`](../frontend/.env.example) for templates. The frontend example is optional for local development with the default proxy.

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

Menus use `GET /students/dining?date=YYYY-MM-DD` and `GET /admin/dining?date=YYYY-MM-DD` to read seven days starting on the requested date. Administrators publish with `PUT /admin/dining/:date`, passing all four meals as `meals: [{ mealType, dishes }]` and an `announcement` string. Each meal requires 1–10 dishes. Announcements appear on the service date only. Publishing menus does not create booking slots.

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

## Production rollout

1. Configure the backend's production environment using the variables above.
2. Install dependencies and build the frontend:

   ```sh
   npm ci --prefix backend
   npm ci --prefix frontend
   npm run build --prefix frontend
   ```

3. Serve `frontend/dist` as a static site, with `index.html` as the fallback for client routes.
4. Start the API with `npm start --prefix backend` and proxy `/api` and `/health` to it. For separate API hosting, set `VITE_API_URL` before building the frontend.
5. Provision accounts and dated slots, then verify login, booking, cancellation, reporting, and camera scanning over HTTPS.

For an existing installation, follow the migration checklist below before switching traffic.

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

## Troubleshooting

| Symptom                             | What to check                                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| API rejects the MongoDB connection  | Use Atlas or a running replica set; standalone MongoDB cannot run booking transactions.                                              |
| No meal slots appear                | Seed dates including today, check the student's floor, and confirm the booking cutoff has not passed.                                |
| Student cannot sign in              | Confirm an administrator enrolled the roll number and assigned a password. Email entry does not authenticate through university SSO. |
| Frontend cannot reach the API       | Check the API port, `/health`, the Vite proxy, and exact `CORS_ORIGINS`. Rebuild after changing `VITE_API_URL`.                      |
| Camera scanner will not start       | Use HTTPS or localhost, allow camera access, and check whether another app is using the camera. Manual code entry is available.      |
| Entry pass is rejected              | Confirm today's date, an unused active booking, and that the current time is within the reserved slot.                               |
| First test run cannot start MongoDB | Allow the test dependency to download its MongoDB binary; subsequent runs use the cached binary.                                     |

## Current limitations and next steps

The application currently has student and administrator roles. A dedicated gate-operator role, university SSO, automated recurring slot generation, meal reminders, and waitlists are potential extensions; they are not implemented features.

Login and scan rate limits are stored per API process. Multiple instances need shared or edge rate limiting. Browser sessions use bearer tokens in browser storage, and physical camera behavior needs testing on the devices used at the gate.

## Contributing

1. Create a branch for a focused change.
2. Follow the route/service/model separation and existing UI components.
3. Add regression tests for changes to booking capacity, authorization, dates, or QR redemption.
4. Run the commands in [Testing](#testing) before opening a pull request.
5. Describe the user-visible behavior, verification, and any migration requirements.

Use synthetic student data in examples and tests. Keep credentials and personal student information out of commits, screenshots, and issue reports.
