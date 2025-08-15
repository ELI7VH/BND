## PLAN 1.1 – Build Log and Next Steps

### What’s in place now
- Root monorepo scripts for one-command run
  - `npm run install:all` – installs deps in `server/` and `web/`
  - `npm run dev` – runs both dev servers concurrently
  - `npm run build` / `npm run start`
- Server (`server/`): TypeScript Express API with Mongo (no auth; placeholders kept)
  - Env via `MONGO_URL`, optional `PORT` (default 4000), `ALLOWED_ORIGIN` (default `http://localhost:5173`)
  - Mongoose models with `userId` defaulting to "user1": `User`, `Song`, `Venue`, `Setlist`, `Show`, `StagePlot`
  - Ensures default `User` record `userId="user1"` at startup
  - Endpoints (MVP):
    - Health: `GET /healthz`
    - Songs: `GET/POST /api/songs`, `GET/PUT/DELETE /api/songs/:id`
    - Venues: `GET/POST /api/venues`, `GET/PUT/DELETE /api/venues/:id`
    - Setlists: `GET/POST /api/setlists`, `GET/PUT/DELETE /api/setlists/:id`
    - Shows: `POST /api/shows`, `GET /api/shows/:id`
    - StagePlot: `GET/POST /api/stageplots/:contextId`
- Web (`web/`): Vite + React app
  - Minimal shell with nav for Songs, Setlists, Venues, Create Show, Stage Plot
  - Simple CRUD create/list UIs for Songs, Venues, Setlists
  - Stage Plot MVP: draggable nodes persisted by contextId (`demo-context`)
  - API base url: `VITE_API_URL` (defaults to `http://localhost:4000`)

### Where progress stopped
- Attempted to run installs but the shell returned: `zsh: command not found: npm`.
- As a result, dependencies are not installed yet and the dev servers were not started.

### What I’ll do after you reload Cursor (and npm is available)
1. Install deps and start both apps:
   - `npm run install:all`
   - `npm run dev`
2. Verify server health at `http://localhost:4000/healthz` (expects `{ status: "ok", mongo: 1 }` when connected).
3. Smoke-test UIs: create a Song, Venue, Setlist; create a Show; add/move/save nodes in Stage Plot.
4. Fix any runtime bugs immediately; iterate until everything is stable.

### Your required local setup
- External MongoDB connection string.
- Create `server/.env` with:
```
MONGO_URL=<your_external_mongo_connection_string>
PORT=4000
ALLOWED_ORIGIN=http://localhost:5173
```
- Optionally, set `VITE_API_URL` in `web/` if not using the default.

### Run (once npm is available)
- From repo root: `npm run install:all` then `npm run dev`
  - Server: http://localhost:4000
  - Web: http://localhost:5173

### Notes
- Auth is intentionally disabled for MVP; placeholders remain to re-enable later.
- All models include `userId` (default "user1"); `User` model stores only non-PII.
