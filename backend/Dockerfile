# Backend Dockerfile (NestJS + Knex + MySQL)
# EasyPanel settings for this service:
# - Build context: backend
# - Dockerfile path: backend/Dockerfile
# - Runtime secrets precedence: host env vars, then .env fallback

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# Install curl for healthchecks (not present in vanilla alpine)
RUN apk add --no-cache curl

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json knexfile.js server.js db-config.js env-bootstrap.js ./
COPY .env ./.env
COPY scripts ./scripts
COPY src ./src

RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install curl for healthchecks (not present in vanilla alpine)
RUN apk add --no-cache curl

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/knexfile.js ./knexfile.js
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/db-config.js ./db-config.js
COPY --from=builder /app/env-bootstrap.js ./env-bootstrap.js
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src/db/migrations ./src/db/migrations
COPY --from=builder /app/src/db/seeds ./src/db/seeds

RUN mkdir -p uploads private_uploads

HEALTHCHECK --interval=20s --timeout=5s --start-period=60s --retries=5 \
  CMD curl -fsS http://localhost:5000/health/live || exit 1

EXPOSE 5000

CMD ["npm", "run", "start:easypanel"]
