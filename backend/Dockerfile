# ── Backend Dockerfile (NestJS + Knex + MySQL) ──
# Easypanel: set Build Method → Dockerfile, port 5000

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json knexfile.js server.js ./
COPY src/ src/

RUN npm run build

# ── Production stage ──
FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/knexfile.js ./
COPY --from=builder /app/server.js ./
COPY --from=builder /app/src/db ./src/db

# uploads directory
RUN mkdir -p uploads private_uploads

EXPOSE 5000

CMD ["node", "server.js"]
