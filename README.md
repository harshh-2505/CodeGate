# CodeGate

A ticketing platform: customers buy event tickets (with a QR code that unlocks an hour before the event) and resell them; organizers list events.

## Quick start

Requires Node.js 22 or newer. No XAMPP, Apache or MySQL needed.

```bash
npm install
npm run dev
```

Open http://localhost:5173. On first run the database is created and seeded with demo data:

| Account | Email | Password |
| --- | --- | --- |
| Organizer | organizer@codegate.com | password123 |
| Customer | customer@codegate.com | password123 |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the API (port 4000) and the Vite client (port 5173) with hot reload |
| `npm run build` | Type-checks and builds both server and client |
| `npm start` | Serves the built app and API together on port 4000 |
| `npm run seed` | Wipes the database and reloads the demo data |
| `npm run typecheck` | Type-checks everything |

Environment variables (all optional): `PORT`, `JWT_SECRET` (set this in production), `DATABASE_FILE`.

## Layout

```
client/   React 19 + TypeScript + Vite, Tailwind CSS v4, Motion, React Router, TanStack Query
  src/pages/       one file per screen group (auth, home, event, tickets, organizer)
  src/components/  shared UI (Layout, EventCard/EventBoard, TicketCard, ui primitives)
  src/fx/          visual effects: custom cursor + trail, grid spotlight, tilt, magnetic buttons, text scramble, generative cover art
  src/hooks/       data fetching and mutations
  src/lib/         API client, types, formatting
server/   Node + Express 5 + TypeScript, SQLite (better-sqlite3), JWT auth, Zod validation
  src/routes/      auth, events, tickets + resale
legacy/   the original single-file React app and PHP API, kept for reference
```

## API

| Method | Path | Who |
| --- | --- | --- |
| POST | `/api/auth/signup`, `/api/auth/login` | anyone |
| GET | `/api/auth/me` | logged in |
| GET | `/api/events`, `/api/events/:id` | anyone |
| POST | `/api/events` | organizers |
| GET / POST | `/api/tickets` | customers (own tickets only) |
| PUT / DELETE | `/api/tickets/:id/resale` | ticket owner |
| GET | `/api/resale` | anyone |
| POST | `/api/resale/:id/buy` | customers |
