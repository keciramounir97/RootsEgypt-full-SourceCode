# Backend Dockerfile (NestJS + Knex + MySQL)
# EasyPanel settings for this service:
# - Build context: backend
# - Dockerfile path: backend/Dockerfile
# - Runtime secrets: host-injected env vars only

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json knexfile.js server.js db-config.js ./
COPY src ./src

RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/knexfile.js ./knexfile.js
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/db-config.js ./db-config.js
COPY --from=builder /app/src/db/migrations ./src/db/migrations
COPY --from=builder /app/src/db/seeds ./src/db/seeds

RUN mkdir -p uploads private_uploads

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["node", "server.js"]
