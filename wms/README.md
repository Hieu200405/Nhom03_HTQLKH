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

## Prerequisites

- Node.js >= 18
- Local MongoDB instance (default: `mongodb://127.0.0.1:27017`)

## Install & Run

```bash
cd wms
npm install
npm run dev          # runs server (4000) and frontend (5173) concurrently
```

## Environment Variables

Create `.env` files from the provided examples:

- `server/.env.example`
- `frontend/.env.example`

Minimum backend configuration:

```
MONGODB_URI=mongodb://127.0.0.1:27017/wms
PORT=4000
JWT_SECRET=supersecret
JWT_REFRESH_SECRET=superrefresh
CLIENT_URL=http://localhost:5173
```

## Seed & Test

- `npm run seed` — populate demo users, catalog, partners, locations, and inventory
- `npm --prefix server test` — run backend Jest + Supertest suite against an in-memory MongoDB

(You can also run `npm run test --workspace server` for the same backend tests.)

## Docker

```bash
docker compose up --build
```

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