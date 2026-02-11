# AppifyDevs — Admin Analytics Dashboard

Live demo: [Live Link](https://appify-devs-frontend-assignment.vercel.app)

## Test accounts (seeded)
- Admin
	- Email: admin@appifydevs.com
	- Password: admin123

- Manager
	- Email: manager@appifydevs.com
	- Password: manager123

---

## Quick Start (Local)

1. Install dependencies

```powershell
npm install
```

2. Start the mock API server (json-server)

```powershell
npm run server
```

3. Start Next.js in development (app + mock API)

```powershell
npm run dev:full
```

Open http://localhost:3000 and log in using the test accounts above. The mock API runs on http://localhost:4000 by default.

## Available Scripts
- `npm run dev` — Next.js dev server
- `npm run server` — json-server mock API (server/db.json)
- `npm run dev:full` — runs both `dev` and `server` concurrently
- `npm run build` — build for production

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Recharts for charts
- Redux Toolkit for state management
- json-server for mock API

## Project Features
- Sidebar navigation (collapsible)
- Top header with notifications and user dropdown
- KPI section with 4 KPI cards (Revenue, Users, Orders, Conversion)
- Line, Bar and Pie charts (Revenue, Orders, User Distribution)
- Date-range and user-type filters
- Responsive layout (mobile-first, sidebar collapses)
- Skeleton loading states and error handling

## Extra / Bonus Features
- **Theme toggle (Dark / Light):** A UI control is available in the header to switch between dark and light themes. The choice is persisted in localStorage and applied app-wide.
- **Role-based dashboards:** The UI adapts for `ADMIN` and `MANAGER` roles. Seeded accounts (see Test accounts) demonstrate role-specific navigation and access to different dashboard views.
- **Export CSV:** Dashboard data can be exported to CSV from KPI or chart panels via the export button (produces a timestamped CSV download of the visible dataset).

## Data & Mock API
This project uses `server/db.json` (json-server). Key endpoints:

- `GET /api/stats` — KPI stats; supports `?period=7d|30d|12m` and `?userType=free|premium|enterprise|all`
- `GET /api/revenue` — revenue time-series
- `GET /api/orders` — orders time-series
- `GET /api/users` — user distribution

The API is started with `npm run server` and exposes `http://localhost:4000` by default.

## Architecture & Decisions
- App is organized under `src/` using feature folders (components, services, redux slices).
- Server-side mock uses `server/index.js` which adds latency and dynamic stats filtering to emulate real-world API behavior.
- `server/db.json` contains seeded KPI and profile data (including the Admin/Manager accounts above).
- Client fetches are routed through a `serverFetch` helper and cache-control mitigations are in place for development.

## Assumptions
- No external authentication provider; auth is simulated via seeded profiles in `server/db.json` for the assignment.

## Environment Variables
This project uses environment variables to control API endpoints and local server behavior.

- `.env.local` (development)

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

- `.env.production` (production)

```dotenv
NEXT_PUBLIC_API_URL=/api
```

Key variables
- `NEXT_PUBLIC_API_URL` — client-facing API base. Use `/api` when using Next.js API routes in the same deployment, otherwise set an absolute URL to an external API.
- `PORT` — the mock server port (default `4000` in `server/index.js`).
- `SIMULATE_ERRORS` — set to `true` to enable occasional simulated errors in the local json-server for testing.

---
AppifyDevs Team — Frontend Assignment
