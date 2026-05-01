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
| **Start Command** | `npm run start:easypanel` (from Dockerfile) |

**Required Environment Variables:**

```bash
NODE_ENV=production
PORT=5000

# Database (use EasyPanel auto-generated values or your own)
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
| **Start Command** | `nginx -g "daemon off;"` (from Dockerfile) |

**Build Arguments / Environment:**
The production frontend uses same-origin `/api` on `rootsegypt.org` so login/signup are not blocked by browser CORS. Do not set `VITE_API_URL` for the canonical frontend unless you intentionally want to bypass the same-origin proxy.

```bash
BACKEND_UPSTREAM=rootsegypt_backend:5000
```

If EasyPanel gives the backend service a different internal DNS name, set `BACKEND_UPSTREAM` to that value, for example:

```bash
BACKEND_UPSTREAM=rootsegypt-backend:5000
```

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
   curl https://api.rootsegypt.org/api/health
   ```
   Same-origin frontend proxy also returns 200:
   ```bash
   curl https://rootsegypt.org/api/health
   ```
2. [ ] Database migrations ran (backend auto-runs on startup via `start:easypanel` script)
3. [ ] Frontend loads without console errors
4. [ ] Login/Signup API responds correctly
5. [ ] CORS preflight (`OPTIONS /api/login`) returns 204 on `https://api.rootsegypt.org`, and same-origin `https://rootsegypt.org/api/login` works without CORS
6. [ ] File uploads (books, gallery, trees) work within size limits

---

## Security Notes

- `JWT_SECRET` must be set; the app now **crashes on startup** if missing (no fallback).
- `.env.example` contains placeholder values only — never commit real credentials.
- Database credentials are injected by EasyPanel at runtime; no secrets in the Docker image.
