# Backend Dockerfile (NestJS + Knex + MySQL)
# EasyPanel settings for this service:
# - Build context: backend
# - Dockerfile path: backend/Dockerfile
# - Runtime secrets: EasyPanel env vars take priority, .env.production is optional fallback

# ======================== BUILDER ========================
FROM node:20-alpine AS builder
WORKDIR /app

# Need curl for healthchecks
RUN apk add --no-cache curl

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json knexfile.js server.js db-config.js env-bootstrap.js ./
COPY scripts ./scripts
COPY src ./src

# .env.production is OPTIONAL — EasyPanel injects env vars at runtime
# Create empty placeholder; if user provides real file, builder-inject stage copies it
RUN touch .env.production

RUN NODE_ENV=production npm run build

# ======================== BUILDER-INJECT ========================
# Tiny stage just to optionally overlay .env.production from build context
FROM builder AS builder-inject
# This stage inherits the empty placeholder from builder.
# If .env.production exists in the build context the user can mount or COPY it
# separately; by default the empty placeholder passes through.

# ======================== RUNTIME ========================
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache curl

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/knexfile.js ./
COPY --from=builder /app/server.js ./
COPY --from=builder /app/db-config.js ./
COPY --from=builder /app/env-bootstrap.js ./
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src/db/migrations ./src/db/migrations
COPY --from=builder /app/src/db/seeds ./src/db/seeds

# Optional .env.production — empty placeholder if not provided
COPY --from=builder /app/.env.production ./.env.production

RUN mkdir -p uploads private_uploads

HEALTHCHECK --interval=20s --timeout=5s --start-period=60s --retries=5 \
  CMD curl -fsS http://localhost:5000/health/live || exit 1

EXPOSE 5000

CMD ["npm", "run", "start:easypanel"]
