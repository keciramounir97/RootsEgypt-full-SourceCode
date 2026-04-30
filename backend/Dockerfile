# ── Backend Dockerfile (NestJS + Knex + MySQL) ──
# Easypanel: set Build Method → Dockerfile, port 5000

# ── Build stage ──
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json knexfile.js server.js ./
COPY .env ./.env
COPY .env.example ./.env.example
COPY src/ src/

RUN npm run build

# ── Production stage ──
FROM node:20-alpine
WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Copy runtime essentials
COPY knexfile.js ./
COPY server.js ./
COPY --from=builder /app/.env ./.env
COPY --from=builder /app/.env.example ./.env.example
COPY src/db/migrations ./src/db/migrations
COPY src/db/seeds ./src/db/seeds

# Uploads directory
RUN mkdir -p uploads private_uploads

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["node", "server.js"]
