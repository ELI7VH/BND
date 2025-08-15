## Vibe App (Travelling Performer) – Coding Plan (PLAN1)

### Goals
- **MVP focus**: CRUD for songs, venues, setlists, and shows with auth deferred (placeholders kept), plus an initial stage plot canvas and lighting automation preview stub.
- **Local run requirement**: App must run locally using an external MongoDB URL supplied via `MONGO_URL` in `.env`.
- **Deployable**: Prepare for DigitalOcean App Platform with environment variables and build commands.

### High-Level Architecture
- **Frontend**: Vite + React, React Router, TanStack Query, React Hook Form
- **Backend**: Node + Express, Mongoose
- **Auth**: Placeholder (Clerk) — disabled for MVP; scaffolding left for easy enablement later
- **DB**: MongoDB (external connection via `MONGO_URL`)

### Environment and Configuration
- **.env variables (root or per app)**
  - Backend
    - `PORT=4000`
    - `MONGO_URL=<external mongo url>`
    - `ALLOWED_ORIGIN=http://localhost:5173`
  - Frontend
    - `VITE_API_URL=http://localhost:4000`
- Auth placeholders (optional, OFF in MVP)
  - Backend: `CLERK_SECRET_KEY`, `CLERK_JWT_AUDIENCE`
  - Frontend: `VITE_CLERK_PUBLISHABLE_KEY`
- **.env.example**: Commit a template for quick onboarding.

### Local Development – How it will run
1. Create `.env` files and set `MONGO_URL` to the external database string provided by you.
2. Install deps and start both apps concurrently.
3. Visit the frontend at `http://localhost:5173`.

### Repository Structure
- `server/` (Express API + Mongoose)
- `web/` (Vite React SPA)
- `shared/` (optional later: shared types/schemas)
- Root scripts for install, dev, build

### Milestones
- **M0: Bootstrap**
  - Initialize `server` and `web` apps
  - Prettier/ESLint config, TypeScript on both sides
  - `.env.example` and README quickstart
- **M1: Auth placeholders (optional, OFF by default)**
  - Keep scaffolding for Clerk in `web` and `server`, but do not enable
- **M2: Core data models + CRUD**
  - Implement Mongoose models for: Song, Chart, Venue, Setlist, Show, StagePlot, LightingAutomation, LightingAdapter
  - Expose CRUD endpoints for Songs, Venues, Setlists; read endpoints for Shows (create basic)
- **M3: Frontend views**
  - Songs list/detail/create (with add-to-setlist)
  - Setlist create/edit
  - Venue create/edit
  - Show create with selections (setlist, venue)
- **M4: Stage plot (MVP)**
  - Canvas-based editor with draggable instruments/positions (Konva or React Flow)
  - Save/load per show or per setlist context
- **M5: Lighting automation (stub)**
  - Define adapter model and simple preview component
  - Attach placeholder preview to stage plot view
- **M6: QA + Deploy readiness**
  - Happy-path tests, health checks, CORS, 404/500 handling
  - Deployment config for DigitalOcean (envs, build commands)

### Backend Plan (`server/`)
- **Dependencies**: `express`, `mongoose`, `cors`, `zod`, `dotenv`, `helmet`, `morgan`
- **Structure**
  - `src/index.ts` – server bootstrap, CORS, JSON, health route
  - `src/config/env.ts` – env loading and validation (zod)
  - `src/auth/verifyClerk.ts` – placeholder for future auth; not wired in MVP
  - `src/models/*.ts` – Mongoose models
  - `src/routes/*.ts` – routers per resource
  - `src/controllers/*.ts` – handlers
  - `src/schemas/*.ts` – zod DTOs for validation
- **CORS**: Allow `ALLOWED_ORIGIN`
- **Health**: `GET /healthz` returns status and mongo connectivity
- **Authentication**: None in MVP. All routes open. Hooks left in place to secure later.
- **Mongoose Models (initial fields)**
  - User: `userId` (string, primary; e.g., "user1"), `handle`, `preferences` (non-PII)
  - All other entities include: `userId` (FK -> `User.userId`) with default value `"user1"` when creating records
  - Song: `title`, `bpm`, `key`, `lyrics`, `streamingLinks[]`, `tags[]`
  - Chart: `songId`, `instrument`, `section`, `chords`, `lyrics`, `versionLabel`
  - Venue: `name`, `address`, `contacts[]`, `stageDimensions`, `electrical`, `lighting`, `audio`, `hours`
  - StagePlot: `context` (showId or templateId), `nodes[]` (type, label, position, io), `notes`
  - LightingAdapter: `venueId`, `mappings` (generic-to-venue map)
  - LightingAutomation: `songId`, `steps[]`
  - Setlist: `name`, `items[]` (songId, notes, mood tags)
  - Show: `name`, `date`, `venueId`, `setlistId`, `arriveAt`, `setupAt`, `parking`, `food`, `technicalNotes`
- **API (MVP)**
  - Songs: `GET /api/songs`, `POST /api/songs`, `GET /api/songs/:id`, `PUT /api/songs/:id`, `DELETE /api/songs/:id`
  - Venues: `GET /api/venues`, `POST /api/venues`, `GET /api/venues/:id`, `PUT /api/venues/:id`, `DELETE /api/venues/:id`
  - Setlists: `GET /api/setlists`, `POST /api/setlists`, `GET /api/setlists/:id`, `PUT /api/setlists/:id`, `DELETE /api/setlists/:id`
  - Shows: `POST /api/shows`, `GET /api/shows/:id`
  - StagePlot: `GET/POST /api/stageplots/:contextId`
  - Health: `GET /healthz`
- **Scripts**
  - `dev`: ts-node-dev nodemon style reload
  - `build`: tsc
  - `start`: node dist/index.js

### Frontend Plan (`web/`)
- **Dependencies**: `react`, `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, UI lib (e.g., `@mantine/core` or Tailwind) – choose one in M0
- **Structure**
  - `src/main.tsx`, `src/App.tsx`, `src/routes/*`
  - `src/api/client.ts` – axios/fetch client with auth header from Clerk
  - `src/components/*`
  - `src/features/{songs,setlists,venues,shows,stageplot}/*`
- **Routing (MVP)**
  - `/songs`, `/songs/new`, `/songs/:id`
  - `/setlists`, `/setlists/new`, `/setlists/:id`
  - `/venues`, `/venues/new`, `/venues/:id`
  - `/shows/new`, `/shows/:id`
  - `/stage-plot/:contextId`
- **Query & Forms**
  - Query keys per resource, optimistic updates later
  - RHF + zod resolver for forms
- **Auth (placeholder)**
  - No auth enabled in MVP. Keep optional wiring notes for Clerk to be added later.

### Stage Plot MVP
- Use `react-konva` (or `react-flow-renderer` alternative) for drag/drop nodes (mic, guitar amp, drum kit, monitors)
- Save node positions to `StagePlot.nodes[]`
- Attach to a `contextId` (showId or template)
- Simple snap-to-grid; later: IO mapping and cable runs

### Lighting Automation Preview (Stub)
- Basic `LightingAutomation` viewer in song detail or stage plot view
- Show steps timeline; integrate with `LightingAdapter` mapping (no real DMX control yet)

### Validation and Error Handling
- Use zod on both client and server for request/response shaping
- Standard error envelope from server `{ error: { code, message, details } }`

### Testing & Quality
- Unit tests on server controllers and schemas (Jest or Vitest)
- Component tests for critical forms (Vitest + React Testing Library)
- Health check and minimal E2E path later (Playwright optional)

- Separate services for `web` and `server` or single service with Docker
- Configure env vars: `MONGO_URL`; if enabling auth later, add Clerk keys; `VITE_*` for web
- Build commands
  - `server`: install, build, start
  - `web`: install, build (`vite build`), serve (DO static hosting or Node serve)

-### Definition of Done for MVP
- No authentication needed
- With only `MONGO_URL` supplied, API starts and connects to external Mongo
- CRUD works for Songs, Venues, Setlists; can create a Show
- Stage plot canvas can add/move/save a few node types
- Lighting preview displays steps without errors

### Risks / Open Questions
- Choose UI library (Mantine vs Tailwind) – propose Mantine for speed
- Pick canvas lib (Konva vs React Flow) – propose Konva for free-form layout
- Scope of lighting automation in MVP – keep as read-only preview

### Root Scripts (planned)
- `npm run dev`: concurrently start `server` and `web`
- `npm run build`: build both
- `npm run lint`: run linters

### Onboarding Quickstart (target)
- Copy `.env.example` to `.env` (root and per app if split)
- Fill `MONGO_URL` with your external URL
- `npm install` at root
- `npm run dev`
- Open `http://localhost:5173`
