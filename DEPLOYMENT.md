# RootsEgypt — Production Deployment Guide (EasyPanel)

## Build Verification

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

Both must exit with code 0 before deploying.

---

## EasyPanel Service Configuration

### 1. Backend Service (`rootsegypt-backend`)

| Setting | Value |
|---------|-------|
| **Repository** | Your Git repo URL |
| **Branch** | `main` |
| **Build Context** | `backend` |
| **Dockerfile Path** | `backend/Dockerfile` |
| **Exposed Port** | `5000` |
| **Healthcheck** | `curl -fsS http://localhost:5000/api/health \|\| exit 1` |
| **Start Command** | leave empty to use Dockerfile `CMD`, or use `npm run start:easypanel` when you want startup migrations |

**Required Environment Variables:**

```bash
NODE_ENV=production
PORT=5000
EASYPANEL_REQUIRE_DB_ON_START=false
EASYPANEL_DB_RETRIES=1
DB_STARTUP_READY_TIMEOUT_MS=3000

# Database (recommended: use EasyPanel auto-generated Internal Connection URL)
DATABASE_URL=mysql://adminegypt:admin2025$@rootsegypt_database-egyptroots:3306/rootsegypt

# OR individual vars:
DB_HOST=rootsegypt_database-egyptroots
DB_PORT=3306
DB_NAME=rootsegypt
DB_USER=adminegypt
DB_PASSWORD=admin2025$

# JWT (generate: openssl rand -hex 64)
JWT_SECRET=<your-64-char-hex-secret>

# CORS
FRONTEND_URL=https://rootsegypt.org
API_URL=https://api.rootsegypt.org
CORS_ORIGIN=https://rootsegypt.org,https://www.rootsegypt.org,https://api.rootsegypt.org

# Email (if using)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

**Database Internal Hostname:**
If your EasyPanel database service is named `rootsegypt_database-egyptroots`, the backend will auto-resolve it via `DATABASE_URL` or `DB_HOST`. Ensure the backend service and database service are on the same Docker network.

### 2. Frontend Service (`rootsegypt-frontend`)

| Setting | Value |
|---------|-------|
| **Repository** | Your Git repo URL |
| **Branch** | `main` |
| **Build Context** | `frontend` |
| **Dockerfile Path** | `frontend/Dockerfile` |
| **Exposed Port** | `80` |
| **Healthcheck** | `curl -fsS http://localhost/healthz \|\| exit 1` |
| **Start Command** | leave empty to use Dockerfile `CMD` (`/docker-start.sh`) |

**Build Arguments / Environment:**
The canonical production frontend uses same-origin `/api` on `rootsegypt.org` so login/signup/reset do not depend on browser CORS. nginx proxies `/api` to the backend service through EasyPanel internal DNS.

```bash
BACKEND_UPSTREAM=rootsegypt_backend:5000
```

If EasyPanel gives the backend service a different internal DNS name, set `BACKEND_UPSTREAM` to that exact `host:port` value.

Do not override the frontend start command with raw `nginx -g "daemon off;"`.
The `/docker-start.sh` command renders nginx with the correct backend upstream and prints `API upstream: ...` in the logs.

**Domains:**

- Attach `rootsegypt.org` and `www.rootsegypt.org` to the frontend service.
- If `api.rootsegypt.org` is attached to the frontend service, the nginx config now treats that hostname as an API-only host and proxies every request to the backend.
- If `api.rootsegypt.org` is attached directly to the backend service instead, it must use backend port `5000`.
- A blank `404` from `https://api.rootsegypt.org/...` means the hostname is not attached to the service that contains the latest nginx/backend config, or EasyPanel is routing it to the wrong service.

### 3. Database Service (MySQL)

EasyPanel auto-creates this. Key values from your screenshot:

| Field | Value |
|-------|-------|
| User | `adminegypt` |
| Password | `admin2025$` |
| Database Name | `rootsegypt` |
| Root Password | `admin2025$` |
| Internal Host | `rootsegypt_database-egyptroots` |
| Internal Port | `3306` |
| Internal Connection URL | `mysql://adminegypt:admin2025$@rootsegypt_database-egyptroots:3306/rootsegypt` |

---

## Post-Deploy Checklist

1. [ ] Backend health endpoint returns 200:
   ```bash
   curl https://api.rootsegypt.org/health/live
   curl https://api.rootsegypt.org/api/health
   ```
   Same-origin frontend proxy also returns 200:
   ```bash
   curl https://rootsegypt.org/api/health
   ```
2. [ ] Database migrations ran (backend auto-runs on startup via `start:easypanel` script)
3. [ ] Frontend loads without console errors
4. [ ] Login/Signup API responds correctly
5. [ ] Same-origin auth uses `https://rootsegypt.org/api/auth/login`; CORS preflight on `https://api.rootsegypt.org` is still useful as an API-domain check but is no longer required for canonical frontend login
6. [ ] File uploads (books, gallery, trees) work within size limits

---

## Security Notes

- `JWT_SECRET` must be set; the app now **crashes on startup** if missing (no fallback).
- `.env.example` contains placeholder values only — never commit real credentials.
- Database credentials are injected by EasyPanel at runtime; no secrets in the Docker image.
