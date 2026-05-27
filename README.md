# Pedalytics

Pedalytics is a single-user, single-bike cycling tracker for manually entering completed rides and reviewing simple statistics. It is built as a compact MVP with server-side SQLite persistence, a clean Fastify API, and a polished Svelte interface.

## Tech Stack

- Monorepo with npm workspaces
- Frontend: Svelte 5, TypeScript, Vite, Chart.js
- Backend: Fastify, TypeScript
- Database: SQLite with Drizzle ORM
- Validation: Zod
- Tests: Vitest

## Install

```bash
npm install
```

## Run

Start the API:

```bash
npm run dev --workspace @pedalytics/api
```

Start the web app in another terminal:

```bash
npm run dev --workspace @pedalytics/web
```

The API defaults to `http://localhost:3333` and the web app defaults to `http://localhost:5173`.

## Database

Run migrations:

```bash
npm run db:migrate
```

Add sample locations, settings, and rides:

```bash
npm run db:seed
```

The SQLite database is stored at `apps/api/data/pedalytics.db` unless `DATABASE_URL` is set.

## Tests

```bash
npm test
```

## MVP Scope

- Dashboard summary cards and distance-by-day chart
- Ride CRUD with reusable departure and destination locations
- Location CRUD
- Single-row settings with home location and metric unit preferences
- Weather service abstraction with wind direction conversion and a weather preview endpoint

Not included in this first draft: authentication, multi-user support, multiple bikes, GPX/FIT imports, route computation, live ride tracking, social features, browser-side persistence, or complex analytics.
