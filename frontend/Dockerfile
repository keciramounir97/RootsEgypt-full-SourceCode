# ── Frontend Dockerfile (Vite + nginx) ──
# Easypanel: set Build Method → Dockerfile, port 80

# ── Build stage ──
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Production stage ──
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# EasyPanel commonly exposes internal service DNS with underscores. Override
# BACKEND_UPSTREAM in the frontend service if the backend DNS name differs.
ENV BACKEND_UPSTREAM=rootsegypt_backend:5000

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["/bin/sh", "-c", "echo '============================================' && echo '   [OK] FRONTEND DEPLOYMENT SUCCESSFUL    ' && echo '   Serving on port 80 (nginx)              ' && echo '============================================' && exec nginx -g 'daemon off;'"]
