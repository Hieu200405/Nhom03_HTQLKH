# syntax=docker/dockerfile:1

FROM node:18-alpine AS base
WORKDIR /app

# Install workspace dependencies
COPY package*.json ./
COPY server/package*.json server/
COPY shared/package*.json shared/
COPY frontend/package*.json frontend/
RUN npm install

# Copy source workspaces required by the API
COPY shared ./shared
COPY server ./server

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/shared ./shared
COPY --from=base /app/server ./server

WORKDIR /app/server
EXPOSE 4000

CMD ["npx", "tsx", "src/index.ts"]

