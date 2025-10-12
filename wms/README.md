# Warehouse Management System (WMS)

Monorepo with a Vite/React frontend, Express/MongoDB backend, and shared utilities package. The platform follows REST best practices, enforces RBAC with JWT auth, and automates core warehouse flows (receipts, deliveries, stocktake, adjustments, reporting).

## Structure

`
wms/
 +- frontend/    # React client (Vite)
 +- server/      # Express API (Swagger docs, Jest tests)
 +- shared/      # Reusable constants and schemas
 +- README.md
`

## Prerequisites

- Node.js >= 18
- Local MongoDB instance (default: mongodb://127.0.0.1:27017)

## Install & Run

`ash
cd wms
npm install
npm run dev          # runs server (4000) and frontend (5173) concurrently
`

Helpful scripts:

- 
pm run dev:server / 
pm run dev:frontend
- 
pm run lint / 
pm run test
- 
pm run build

## Environment Variables

Create .env files from the provided examples:

- server/.env.example
- rontend/.env.example

Minimum backend configuration:

`
MONGODB_URI=mongodb://127.0.0.1:27017/wms
PORT=4000
JWT_SECRET=supersecret
JWT_REFRESH_SECRET=superrefresh
CLIENT_URL=http://localhost:5173
`

## Seed & Test

- 
pm run seed — populate demo users, catalog, partners, locations, and inventory
- 
pm --prefix server test — run backend Jest + Supertest suite against an in-memory MongoDB

(You can also run 
pm run test --workspace server for the same backend tests.)

## Docker

`ash
docker compose up --build
`

## Deploy

### Backend (Render / Railway / Fly.io)
1. Connect this repo and point the service to wms/server.
2. Set build command 
pm install and start command 
pm --prefix server run start or 
ode dist/index.js after adding a build step (
pm --prefix server run build).
3. Configure environment variables:
   - MONGODB_URI — Atlas connection string
   - JWT_SECRET — secure random secret
   - JWT_REFRESH_SECRET — optional refresh secret
   - CLIENT_URL — public frontend URL

### Frontend (Vercel / Netlify)
1. Deploy wms/frontend with build command 
pm install && npm run build.
2. Serve from dist/ (Netlify) or default Vercel static output.
3. Environment variables:
   - VITE_API_BASE_URL — backend public URL (e.g., https://api.example.com/api/v1)

## API Docs

- Swagger UI: http://localhost:4000/api-docs
- Postman: server/wms.postman_collection.json

## Husky

Hooks install automatically via 
pm install (prepare script). The pre-commit hook runs 
pm run lint across all workspaces.
