# Paddock20

**An automotive lifestyle platform for enthusiasts — your car's command center.**

Paddock20 blends practical vehicle management (maintenance, tires, mods) with a premium, data-driven driving experience (automotive weather telemetry, route planning, drive logging, and curated culture). It's wrapped in a high-performance, F1-inspired interface built for people who actually care about their cars.

---

## Table of Contents

- [Overview](#overview)
- [Feature Highlights](#feature-highlights)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [API Surface](#api-surface)
- [External Integrations](#external-integrations)
- [Security & Authentication](#security--authentication)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Deployment](#deployment)

---

## Overview

Paddock20 is a full-stack TypeScript application. The frontend is a React single-page app; the backend is a thin Express API responsible for persistence and brokering third-party API calls. Everything runs on a single port in development via Vite middleware.

The product is organized around **"The Paddock"** — a unified command center that surfaces vehicle status, live environmental telemetry, and quick access to every feature.

## Feature Highlights

- **The Paddock (Unified Dashboard)** — Central hub for vehicle status, driver profile, live telemetry, and feature navigation.
- **Garage Vault** — Manage multiple vehicles with detailed specs, maintenance records, tire tracking (pressures/sizes/install dates), and modification logs.
- **Weather Paddock** — Automotive-specific weather: estimated track surface temperature, grip levels, tire warm-up recommendations, compound estimates, and UV index.
- **Drive Journal & Route Planner** — Log drives and plan routes with integrated weather warnings and performance recommendations.
- **Juice Box (Detailing)** — Gloss tracking, product organization, protection/beading ratings, and before/after detailing logs.
- **Premium Integrations** — Spotify drive soundtracks, vehicle telemetry (Smartcar / OBD-II), and Slack sharing.
- **Gamification** — Engagement tracking and goal-setting ("Podium Pursuit").
- **Admin & Audit** — Administrative dashboard with full authentication audit logging.

## Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite 5** (build & dev server)
- **Tailwind CSS 3** + **shadcn/ui** (Radix UI primitives)
- **Framer Motion** (animations)
- **Wouter** (routing)
- **TanStack Query v5** (server state) + **Zustand** (client state)
- **React Hook Form** + **Zod** (forms & validation)
- **Recharts** (data visualization)
- **Lucide React** / **React Icons** (iconography)

### Backend
- **Node.js 20** + **Express 4**
- **TypeScript** executed via **tsx** (dev) and bundled with **esbuild** (prod)
- **Passport.js** (local strategy, scrypt hashing)
- **express-session** + **connect-pg-simple** (PostgreSQL-backed sessions)

### Data
- **PostgreSQL** (Neon serverless via `@neondatabase/serverless` + WebSockets)
- **Drizzle ORM** + **drizzle-zod** (type-safe schema & validation)
- **drizzle-kit** (schema migrations)

### Shared
- A single **`shared/schema.ts`** is the source of truth for the data model, used by both client and server for end-to-end type safety.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (SPA)                        │
│   React + TanStack Query + Zustand + shadcn/ui + Wouter   │
└───────────────────────────┬─────────────────────────────┘
                            │  /api/*  (JSON over HTTP)
┌───────────────────────────▼─────────────────────────────┐
│                   Express API (Node 20)                   │
│  Routes → IStorage interface → Drizzle ORM                │
│  Passport auth · Session store · Health monitor           │
│  Integration brokers (Weather, Spotify, Slack, Smartcar)  │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│              PostgreSQL (Neon serverless)                  │
└──────────────────────────────────────────────────────────┘
```

Key design principles:
- **Thin backend** — routes stay small and delegate persistence to a single `IStorage` abstraction, decoupling handlers from the database.
- **Type safety end to end** — the Drizzle schema generates both DB types and Zod insert schemas shared by the frontend.
- **Consolidated APIs** — e.g. `/api/weather/consolidated` combines current weather, forecast, OneCall data, and automotive metrics into one response to minimize latency and rate-limit pressure.
- **Background health monitoring** — a service periodically pings external APIs and tracks operational status.

## Data Model

Defined in `shared/schema.ts` (Drizzle ORM, PostgreSQL):

| Table | Purpose |
|-------|---------|
| `users` | Profiles, roles (`user` / `admin` / `premium`), unit preferences, 2FA secrets, security questions, account lockout, Stripe customer linkage |
| `sessions` | Persistent authentication sessions (indexed by user & expiry) |
| `auth_logs` | Audit trail for login / logout / register / password events |
| `saved_locations` | User locations for weather & route lookups |
| `vehicles` | Make/model/year/trim/VIN, mileage, status, "Gloss Index" |
| `tires` | Brand/model/type, front & rear sizes, recommended vs. current pressures |
| `maintenance_records` | Service type, date, mileage, cost, provider, receipts |
| `maintenance_flags` | Upcoming/overdue service alerts (due date/mileage, urgency) |
| `gloss_tracking` | Current detailing product, protection/gloss/beading ratings |
| `gloss_logs` | Detailing process history with before/after images |
| `modifications` | Performance/aesthetic mods with cost, installer, warranty, affected systems |

Each table ships with a generated **insert schema** (via `createInsertSchema`) and exported **select/insert types** for use across the stack.

## API Surface

Selected endpoints (full set lives in `server/routes.ts` and `server/routes/`):

**System**
- `GET /api/health-check` — service availability
- `GET /api/test` — connectivity check
- `GET /api/env-check` — validates presence of required env vars

**Weather**
- `GET /api/weather/consolidated` — current + forecast + OneCall + automotive metrics in one payload

**User & Routes**
- `GET /api/user` · `PUT /api/user`
- `GET /api/user-profile/me`
- `GET /api/routes` · `POST /api/routes` · `GET /api/routes/:id/weather`

**Vehicles**
- `GET /api/vehicles` · `POST /api/vehicles`
- `GET /api/vehicles/:id/maintenance-records`
- `POST /api/tires`

**Auth & Security**
- `register` / `login` / `logout`
- `POST /api/2fa/setup` · `/enable` · `/disable` · `/verify`

**Integrations**
- Spotify: `POST /token` · `/refresh-token` · `/connection-status`
- Smartcar: `GET /auth-url` · `POST /exchange` · `GET /vehicles/:vehicleId` · `/action`
- OBD: proxied to a local diagnostics service

**Admin**
- `GET /api/admin/users` (admin only)
- `GET /api/admin/audit-log`

## External Integrations

| Service | Use |
|---------|-----|
| **OpenWeather** (2.5 + OneCall 3.0) | Primary weather + custom automotive metrics (track temp, grip, compounds) |
| **Spotify** | Drive soundtracks & weather-based recommendations |
| **Smartcar** | Remote vehicle data & actions (lock/unlock) |
| **OBD-II** | Real-time local vehicle diagnostics |
| **Slack** | Sharing vehicles & events to channels |
| **Unsplash** | Dynamic vehicle & background imagery |
| **Auth0** | JWT-based auth + Management API for roles/beta access |
| **Supabase** | Alternative auth/profile sync provider |
| **Stripe** | Customer/subscription linkage |
| **SendGrid** | Transactional email |

## Security & Authentication

- **Password hashing** with scrypt via Passport's local strategy.
- **Two-factor authentication** (TOTP) — successful password entry returns `requiresTwoFactor`; the session is only fully established after `POST /api/2fa/verify`.
- **Multi-provider auth** — local, Auth0 (JWT), and Supabase supported in parallel.
- **Account protection** — failed-attempt tracking and account lockout.
- **Audit logging** — every auth-relevant action is recorded in `auth_logs` with IP, user agent, and outcome.
- **Role-based access** — `requireAuth` and `checkAdmin` middleware guard protected and administrative routes.
- **Strong password policy** enforced via Zod (min length, upper/lower/number).

> ⚠️ A demo mode currently bypasses Auth0 for local testing (auto-loads a demo user). Disable it before exposing the app publicly.

## Project Structure

```
.
├── client/               # React SPA
│   └── src/
│       ├── pages/        # Route pages (Paddock, Garage, Weather, etc.)
│       ├── components/    # UI, dashboard, weather, telemetry, admin
│       ├── services/     # Client-side API & integration services
│       ├── hooks/  context/  store/      # State & shared logic
│       └── lib/  utils/  types/
├── server/               # Express API
│   ├── routes.ts  routes/  # Endpoint definitions
│   ├── storage.ts          # IStorage abstraction over Drizzle
│   ├── db.ts               # Neon/Drizzle connection
│   ├── auth.ts  middleware/  twoFactor.ts
│   ├── services/  slack.ts  healthMonitor.ts  initServices.ts
│   └── index.ts            # App entry
├── shared/
│   └── schema.ts         # Drizzle schema + Zod + shared types
├── drizzle.config.ts
├── vite.config.ts
└── package.json
```

## Getting Started

**Prerequisites:** Node.js 20+, a PostgreSQL database (Neon recommended).

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (see below)
cp .env.example .env   # then fill in values

# 3. Push the schema to your database
npm run db:push

# 4. Start the dev server (frontend + backend on one port)
npm run dev
```

The app serves at `http://localhost:5000`.

## Environment Variables

Core variables the app expects (validate with `GET /api/env-check`):

```
DATABASE_URL=postgres://...        # Neon/PostgreSQL connection string
SESSION_SECRET=...                 # Express session signing secret
OPENWEATHER_API_KEY=...            # Weather data
UNSPLASH_ACCESS_KEY=...            # Imagery
SLACK_BOT_TOKEN=...                # Slack sharing (optional)
SPOTIFY_CLIENT_ID=...              # Spotify integration
SPOTIFY_CLIENT_SECRET=...
AUTH0_DOMAIN=...                   # Auth0 (optional provider)
AUTH0_CLIENT_ID=...
SMARTCAR_CLIENT_ID=...             # Vehicle telemetry (optional)
SMARTCAR_CLIENT_SECRET=...
STRIPE_SECRET_KEY=...              # Billing (optional)
SENDGRID_API_KEY=...              # Email (optional)
```

> Manage secrets through your hosting platform's secret store — never commit them.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Express + Vite in development |
| `npm run build` | Build the frontend (Vite) and bundle the server (esbuild) |
| `npm start` | Run the production build |
| `npm run check` | TypeScript type-check |
| `npm run db:push` | Push the Drizzle schema to the database |

## Deployment

The build produces a static frontend plus a bundled Node server (`dist/index.js`). Run with:

```bash
npm run build
NODE_ENV=production node dist/index.js
```

Provide all required environment variables in your production environment and ensure `DATABASE_URL` points at your production PostgreSQL instance.

---

*Built with TypeScript end to end — one schema, one source of truth, zero drift between client and server.*
