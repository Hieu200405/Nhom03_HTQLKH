# Warehouse Management System (WMS)

Monorepo with a Vite/React frontend, Express/MongoDB backend, and shared utilities package. The platform follows REST best practices, enforces RBAC with JWT auth, and automates core warehouse flows (receipts, deliveries, stocktake, adjustments, reporting).

## Structure

```
wms/
 |- frontend/    # React client (Vite)
 |- server/      # Express API (Swagger docs, Jest tests)
 |- shared/      # Reusable constants and schemas
 |- README.md
```

## Quick Start (Docker)

> Clone the repository and run everything with a single command. No local Node/MongoDB setup required—just Docker Desktop.

```bash
git clone <repo-url>
cd wms
npm run docker:up
```

Services become available once the logs show `Server listening`:

- API: http://localhost:4000
- Swagger UI: http://localhost:4000/api-docs
- Web app: http://localhost:5173

To stop the stack run `npm run docker:down`. Follow the logs with `npm run docker:logs`.

## Local Development

If you prefer running directly on your machine:

```bash
cd wms
npm install
npm run setup     # copies .env.example files if missing
npm run dev       # starts API (4000) + frontend (5173)
```

Default configuration works out of the box (MongoDB expected at `mongodb://127.0.0.1:27017`). Adjust `server/.env` or `frontend/.env` if needed.

## Seed & Test

- `npm run seed` — populate demo users, catalog, partners, locations, and inventory
- `npm --prefix server test` — run backend Jest + Supertest suite against an in-memory MongoDB

(You can also run `npm run test --workspace server` for the same backend tests.)

## Docker

Use the provided npm scripts instead of memorising Docker commands:

- `npm run docker:up` — build and start all services
- `npm run docker:down` — stop the stack
- `npm run docker:logs` — follow container logs

If you prefer the raw command it is still available: `docker compose up --build`.

## Deploy

### Backend (Render / Railway / Fly.io)
1. Connect this repo and point the service to `wms/server`.
2. Set build command `npm install` and start command `npm --prefix server run start` or `node dist/index.js` after adding a build step (`npm --prefix server run build`).
3. Configure environment variables:
   - `MONGODB_URI` — Atlas connection string
   - `JWT_SECRET` — secure random secret
   - `JWT_REFRESH_SECRET` — optional refresh secret
   - `CLIENT_URL` — public frontend URL

### Frontend (Vercel / Netlify)
1. Deploy `wms/frontend` with build command `npm install && npm run build`.
2. Serve from `dist/` (Netlify) or default Vercel static output.
3. Environment variables:
   - `VITE_API_BASE_URL` — backend public URL (e.g., `https://api.example.com/api/v1`)

## API Docs

- Swagger UI: `http://localhost:4000/api-docs`
- Postman: `server/wms.postman_collection.json`

## Husky

Hooks install automatically via `npm install` (`prepare` script). The pre-commit hook runs `npm run lint` across all workspaces.
