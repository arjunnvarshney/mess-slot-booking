# Bennett Dining

**Reserve a meal. Choose a slot. Show your entry pass.**

A campus dining project for the Bennett University community, built with React, Express, and MongoDB. Students reserve meals and manage entry passes; administrators manage dining slots, menus, students, and reports.

[Hosted application](https://mess-slot-booking-frontend.onrender.com/) · [Local setup](#run-locally) · [Developer guide](docs/DEVELOPMENT.md)

## Explore the demo

Choose **Try student demo** on the login screen to explore without an account:

- Browse seven days of sample menus.
- Book, reschedule, and cancel sample meals.
- Preview an entry pass and reset the demo.

The demo runs entirely in your browser and uses no real student records. It uses a labelled 7:00 AM demo clock so every meal can be explored. Demo passes cannot be used at the gate. Refreshing clears sample reservations.

**Availability:** the demo button requires deployment of the latest frontend changes. You can already try it locally at `http://localhost:5173/demo` using the commands below. Once deployed, its hosted route is `/demo`.

No public account credentials are needed. The temporary development accounts mentioned during testing are not hosted demo accounts.

## Features

| Students                                         | Administrators                                         |
| ------------------------------------------------ | ------------------------------------------------------ |
| Book breakfast, lunch, snacks, and dinner        | Create daily slots and manage capacity                 |
| View menus and dated announcements               | Publish menus and announcements                        |
| Cancel or change a reservation before the cutoff | Enroll students and manage account access              |
| Reopen a single-use QR entry pass                | Verify entry with camera scanning or manual code entry |
| Review booking history                           | View dining analytics and export CSV reports           |

The interface supports mobile navigation and light/dark themes. Unpublished menus display clearly labelled sample dishes, not confirmed university menus.

## Booking rules

- One active reservation per meal per student per day.
- Booking, cancellation, and rescheduling close 15 minutes before a slot starts.
- Capacity and reservations update together in a database transaction.
- Entry passes are accepted once, during the booked slot.
- All service dates and times use **Asia/Kolkata (IST)**.

## Run locally

**Requirements:** Node.js 22.12+; MongoDB Atlas or a replica set for the full application.

```sh
git clone https://github.com/arjunnvarshney/mess-slot-booking.git
cd mess-slot-booking
npm ci --prefix frontend
npm run dev --prefix frontend
```

Open the URL printed by Vite and select **Try student demo**. The demo works without a backend or database.

For real accounts and persistent bookings:

1. Run `npm ci --prefix backend`.
2. Copy `backend/.env.example` to `backend/.env`. Set `MONGO_URI` and a random `JWT_SECRET` of at least 32 characters.
3. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` locally, then run `node backend/createAdmin.js`. Passwords need at least 12 characters and at most 72 UTF-8 bytes.
4. Run `npm run seed:slots --prefix backend` to create seven days of slots.
5. In a separate terminal, run `npm run dev --prefix backend`.
6. Sign in as an administrator and enroll students.

See the [developer guide](docs/DEVELOPMENT.md#local-setup) for complete setup and configuration. Student email entry maps to an enrolled roll number; university SSO is not implemented.

## Checks

```sh
npm test --prefix backend
npm test --prefix frontend
npm run lint --prefix frontend
npm run format:check --prefix frontend
npm run build --prefix frontend
```

Backend tests use an isolated temporary MongoDB replica set. GitHub Actions runs these checks on pushes and pull requests.

## Documentation

- [Architecture and project structure](docs/DEVELOPMENT.md#project-layout)
- [Configuration and API reference](docs/DEVELOPMENT.md#configuration)
- [Deployment and migration](docs/DEVELOPMENT.md#production-rollout)
- [Troubleshooting](docs/DEVELOPMENT.md#troubleshooting)

Before upgrading an existing installation, read the migration checklist: older sessions and QR passes are not compatible with the current booking flow.

Built as a student project for the Bennett University community; not an official university service.
