# Backend Dockerfile (NestJS + Knex + MySQL)
# EasyPanel settings:
# - Build context: repository root
# - Dockerfile path: backend/Dockerfile
# - Runtime secrets: host-injected env vars only

FROM node:20-alpine AS builder
WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/tsconfig.json backend/knexfile.js backend/server.js backend/db-config.js ./
COPY backend/src ./src

RUN npm run build

FROM node:20-alpine
WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/knexfile.js ./knexfile.js
COPY --from=builder /app/backend/server.js ./server.js
COPY --from=builder /app/backend/db-config.js ./db-config.js
COPY --from=builder /app/backend/src/db/migrations ./src/db/migrations
COPY --from=builder /app/backend/src/db/seeds ./src/db/seeds

RUN mkdir -p uploads private_uploads

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["node", "server.js"]
