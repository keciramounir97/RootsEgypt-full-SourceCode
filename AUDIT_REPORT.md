# RootsEgypt Backend + Frontend Audit Report

Generated: 2026-05-01 00:55 Africa/Algiers

Scope: local workspace plus deployed `https://api.rootsegypt.org/api`, `https://rootsegypt.org`, and `https://www.rootsegypt.org`.

No application source files were changed. Build artifacts produced by normal `npm run build` commands are ignored by git. Secrets were not printed.

## Executive Summary

The frontend source builds and lints successfully, and the deployed frontend serves the SPA for public/admin/unknown routes. The production backend API is not reachable through the documented host: every checked production API route, including health and CORS preflight, returned `404`. Local backend runtime validation is also blocked because the checked-in local `.env` points at the EasyPanel-only database hostname `rootsegypt_database-egyptroots`, which does not resolve on this machine.

Authenticated, upload, database mutation, and role-parity checks are therefore blocked until either a local DB-compatible `.env` is supplied or production API routing is restored. Browser Use was initialized successfully once and loaded the local homepage, but repeated multi-route Browser Use checks became unstable with the plugin runtime reporting a missing app-server path; direct HTTP route checks were used for the rest of frontend route coverage.

## Prioritized Findings

| Severity | ID | Area | Finding | Evidence | Suggested fix direction |
| --- | --- | --- | --- | --- | --- |
| Critical | F-001 | Production backend | `https://api.rootsegypt.org` does not expose the expected API. Health, auth, public data, admin, CORS preflight, and root routes all returned 404. | `GET /api/health`, `/api/health/live`, `/api/trees`, `/api/books`, `/api/gallery`, `/api/auth/me` all returned `404`; POST routes returned `{"message":"Route POST:/api/errors/not-found not found"}`. Source expects root and `/api` health aliases in `backend/src/main.ts:484` and `backend/src/main.ts:517`. | Check production reverse proxy/EasyPanel routing. Requests appear rewritten to `/api/errors/not-found` without preserving original URI headers. Ensure API service is deployed, bound to port 5000, and proxy forwards `/api/*` to the Nest process without losing path. |
| Critical | F-002 | Dependencies/security | Production dependency audits report critical packages in both apps. | Backend `npm audit --omit=dev`: 1 critical, 5 high, 6 moderate, 1 low. Critical direct dependency: `mysql2 <=3.9.7`. Frontend audit: 1 critical, 4 high, 3 moderate. Critical direct dependency: `jspdf <=4.2.0`. | Upgrade vulnerable packages, starting with `mysql2`, `jspdf`, `axios`, `vite`, `express-rate-limit`, and Nest platform packages. Re-run audit and smoke tests after lockfile changes. |
| High | F-003 | Local backend/runtime | Local backend cannot start with existing `.env`; DB hostname is production-internal. | `npm run start:prod` logs `ERROR DB HANDSHAKE FAILED: getaddrinfo ENOTFOUND rootsegypt_database-egyptroots`; local `GET http://127.0.0.1:5000/api/health/live` failed. Runtime loads `.env` with `host=rootsegypt_database-egyptroots`. | Provide a local `.env`/override for a reachable MySQL instance, or document Docker/local DB startup. Keep production EasyPanel host values out of the default local runtime path. |
| High | F-004 | CORS/integration | Production CORS preflight is broken because API routing fails before CORS middleware can respond. | `OPTIONS https://api.rootsegypt.org/api/auth/login` with `Origin: https://rootsegypt.org` returned `404`, no `Access-Control-Allow-Origin`. Source defines expected CORS handling in `backend/src/main.ts:552` and fallback preflight in `backend/src/main.ts:603`. | Fix API proxy routing first, then retest preflight allow/deny behavior for `rootsegypt.org`, `www.rootsegypt.org`, localhost, and a disallowed origin. |
| High | F-005 | Local parity | Local frontend currently targets production API by default. | `frontend/.env` contains `VITE_API_URL=https://api.rootsegypt.org`; `frontend/src/api/client.ts:9` uses `VITE_API_URL`, and `frontend/src/api/client.ts:37` appends `/api`. | For local integration audits, set `VITE_API_URL=http://localhost:5000` after making local backend runnable. Keep production API configuration for production builds only. |
| Medium | F-006 | Frontend/API UX | Frontend is deployed and reachable, but all real API-backed pages depend on a production API that returns 404. | Deployed frontend routes `/`, `/gallery`, `/library`, `/admin`, and unknown SPA fallback returned `200`; API calls to `/api/*` returned 404. | Once API routing is fixed, rerun browser checks to verify page-level error states, public data rendering, auth redirects, and admin access. |
| Medium | F-007 | Mock fallback risk | Mock API code accepts arbitrary credentials and unknown routes if enabled, though current code disables it. | `frontend/src/lib/mockApi.ts:37` returns `false`, but mock adapter still has permissive auth at `frontend/src/lib/mockApi.ts:98` and unknown endpoint success at `frontend/src/lib/mockApi.ts:555`. `frontend/src/main.tsx:18` clears mock storage keys on startup. | Keep mock adapter excluded from production bundles or behind a build-time dev flag. Add a test/assertion that mock mode cannot activate in production. |
| Medium | F-008 | Test coverage | Test commands are configured but no backend or frontend test files exist. | Backend `npm test -- --runInBand`: no `*.spec.ts` found. Frontend `npm test -- --run`: no `*.test`/`*.spec` files found. | Add focused smoke/unit tests around auth client behavior, API envelope normalization, guards, CORS config, upload validation, and protected route redirects. |
| Low | F-009 | Bundle size | Frontend production build succeeds but emits a large chunk warning. | `npm run build`: `assets/index-DbZ0Gk6x.js` is 1,483.05 kB, gzip 440.33 kB; Vite warns chunk is larger than 500 kB. | Split admin/public route bundles with dynamic imports and manual chunks for large libraries such as map/pdf/animation tooling. |
| Low | F-010 | Browser tooling | Browser Use validation was partial due plugin instability. | Browser Use successfully loaded local `/` once; subsequent multi-route checks failed with `failed to start codex app-server: Le chemin d'accès spécifié est introuvable`. Screenshot capture also timed out. | Rerun Browser Use after plugin/runtime repair. Current browser-specific UI coverage should be treated as partial. |

## Test Matrix

### Backend API

| ID | Target | Environment | Scenario | Expected | Actual | Status | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B-ROOT-PROD-1 | `GET https://api.rootsegypt.org/` | Production | API root info | 200 JSON root info | 404 HTML Not Found | Fail | Critical |
| B-ROOT-PROD-2 | `GET /api` | Production | API prefixed root info | 200 JSON root info | 404 HTML Not Found | Fail | Critical |
| B-HEALTH-PROD-1 | `GET /api/health` | Production | Readiness health | 200 or 503 JSON | 404 HTML Not Found | Fail | Critical |
| B-HEALTH-PROD-2 | `GET /api/health/live` | Production | Liveness health | 200 JSON | 404 HTML Not Found | Fail | Critical |
| B-HEALTH-PROD-3 | `GET /health/live` | Production | Root health alias | 200 JSON | 404 HTML Not Found | Fail | Critical |
| B-DB-PROD-1 | `GET /api/db-health` | Production | DB health | 200 or 503 JSON | 404 HTML Not Found | Fail | Critical |
| B-PUBLIC-PROD-1 | `GET /api/trees` | Production | Public trees list | 200 JSON | 404 HTML Not Found | Fail | Critical |
| B-PUBLIC-PROD-2 | `GET /api/books` | Production | Public books list | 200 JSON | 404 HTML Not Found | Fail | Critical |
| B-PUBLIC-PROD-3 | `GET /api/gallery` | Production | Public gallery list | 200 JSON | 404 HTML Not Found | Fail | Critical |
| B-PUBLIC-PROD-4 | `GET /api/search?q=roots` | Production | Public search | 200 JSON | 404 HTML Not Found | Fail | Critical |
| B-AUTH-PROD-1 | `POST /api/auth/login` | Production | Invalid credentials | 400 or 401 JSON | 404 JSON, route rewritten to `/api/errors/not-found` | Fail | Critical |
| B-AUTH-PROD-2 | `GET /api/auth/me` | Production | Missing token | 401 JSON | 404 HTML Not Found | Fail | Critical |
| B-AUTH-PROD-3 | `POST /api/auth/refresh` | Production | Invalid refresh token | 400 or 401 JSON | 404 JSON, route rewritten to `/api/errors/not-found` | Fail | Critical |
| B-AUTH-PROD-4 | `POST /api/auth/reset/verify` | Production | Invalid reset code | 400 or 401 JSON | 404 JSON, route rewritten to `/api/errors/not-found` | Fail | High |
| B-AUTHZ-PROD-1 | `GET /api/admin/users` | Production | Unauthenticated admin list | 401 or 403 JSON | 404 HTML Not Found | Fail | Critical |
| B-AUTHZ-PROD-2 | `GET /api/admin/admins` | Production | Unauthenticated super-admin list | 401 or 403 JSON | 404 HTML Not Found | Fail | Critical |
| B-AUTHZ-PROD-3 | `GET /api/my/trees` | Production | Unauthenticated user-only route | 401 JSON | 404 HTML Not Found | Fail | High |
| B-VALID-PROD-1 | `POST /api/newsletter/subscribe` | Production | Invalid email validation | 400 JSON | 404 JSON, route rewritten to `/api/errors/not-found` | Fail | High |
| B-VALID-PROD-2 | `POST /api/contact` | Production | Invalid contact payload | 400 JSON | 404 JSON, route rewritten to `/api/errors/not-found` | Fail | High |
| B-CORS-PROD-1 | `OPTIONS /api/auth/login` | Production | Allowed-origin preflight | 204 with CORS headers | 404, no CORS allow header | Fail | High |
| B-CORS-PROD-2 | `OPTIONS /api/auth/login` | Production | Disallowed-origin preflight | Deny/no allow origin | 404, no CORS headers | Fail | Medium |
| B-SEC-PROD-1 | `GET /uploads/../.env` | Production | Path traversal attempt | 404/403, no secret leakage | 404 HTML, no secret leaked | Pass | Low |
| B-LOCAL-1 | `GET http://127.0.0.1:5000/api/health/live` | Local | Local backend liveness | 200 JSON | Connection failed because backend could not start | Blocked | High |

### Frontend

| ID | Target | Environment | Scenario | Expected | Actual | Status | Severity |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-LOCAL-1 | `/` | Local Vite | SPA route refresh | 200 HTML | 200 HTML | Pass | Low |
| F-LOCAL-2 | `/admin` | Local Vite | Protected route refresh | 200 HTML, client redirects after auth check | 200 HTML | Pass, visual redirect not fully verified | Low |
| F-LOCAL-3 | `/gallery` | Local Vite | Public route refresh | 200 HTML | 200 HTML | Pass | Low |
| F-LOCAL-4 | `/nonexistent-audit-route` | Local Vite | SPA fallback to app error route | 200 HTML | 200 HTML | Pass | Low |
| F-PROD-1 | `https://rootsegypt.org/` | Production | Home route | 200 HTML, security headers | 200 HTML, `X-Frame-Options: SAMEORIGIN`, `nosniff` | Pass | Low |
| F-PROD-2 | `/admin` | Production | Admin route refresh | 200 HTML, client auth redirect | 200 HTML | Pass, auth redirect blocked by Browser Use instability | Low |
| F-PROD-3 | `/gallery` | Production | Public route refresh | 200 HTML | 200 HTML | Pass | Low |
| F-PROD-4 | `/nonexistent-audit-route` | Production | SPA fallback | 200 HTML | 200 HTML | Pass | Low |
| F-WWW-1 | `https://www.rootsegypt.org/` | Production WWW | Home route | 200 HTML | 200 HTML | Pass | Low |
| F-WWW-2 | `https://www.rootsegypt.org/admin` | Production WWW | Admin route refresh | 200 HTML | 200 HTML | Pass | Low |
| F-BUILD-1 | `npm run lint` | Local frontend | Static lint | Exit 0 | Exit 0 | Pass | Low |
| F-BUILD-2 | `npm run build` | Local frontend | Production build | Exit 0 | Exit 0 with large chunk warning | Pass with warning | Low |
| F-TEST-1 | `npm test -- --run` | Local frontend | Test suite | Tests execute | No test files found, exit 1 | Fail/gap | Medium |

### Integration, Security, and Deployment Readiness

| ID | Area | Scenario | Expected | Actual | Status | Severity |
| --- | --- | --- | --- | --- | --- | --- |
| I-001 | Frontend API base | Local frontend should be able to target local backend for local integration | `VITE_API_URL=http://localhost:5000` or equivalent local override | `VITE_API_URL=https://api.rootsegypt.org` | Fail/parity gap | High |
| I-002 | API envelope | Frontend normalizes backend envelope | Axios interceptor unwraps wrapped `data` responses | Source supports unwrap in `frontend/src/api/client.ts:107` | Static pass | Low |
| I-003 | Auth refresh | Refresh failure clears local auth | 401 attempts refresh, clears token/refreshToken, redirects login | Source implements this in `frontend/src/api/client.ts:165` | Static pass; runtime blocked by API 404 | Medium |
| I-004 | Protected admin route | Unauthenticated admin route redirects to login | `ProtectedRoute` waits then navigates login | Source implements this in `frontend/src/admin/components/protectedRoute.tsx:24` | Static pass; visual runtime partial | Low |
| S-001 | Backend security headers | API responses should include Helmet/no-store headers | `X-Frame-Options: DENY`, `nosniff`, no-store | Production API returns proxy 404 without backend headers | Fail due routing | High |
| S-002 | Upload MIME | Gallery image uploads enforce type/size | 10 MB image MIME validation | Source uses `MaxFileSizeValidator` and `FileTypeValidator` in gallery controller | Static pass; runtime blocked | Medium |
| S-003 | JWT secret | Missing JWT secret should crash startup | No insecure fallback | Source throws if `JWT_SECRET` missing in auth module/strategy | Static pass | Low |
| S-004 | Refresh token rotation | Refresh token should rotate | Delete old token and insert new token | Source does this in `auth.service.ts` | Static pass; runtime blocked | Medium |
| S-005 | Dependency audit | No critical/high production advisories | Clean audit or accepted risk | Backend and frontend both have critical/high advisories | Fail | Critical |

## Command Results

| Command | Result |
| --- | --- |
| `backend npm test -- --runInBand` | Failed: no Jest `*.spec.ts` tests found. |
| `backend npm run build` | Passed. |
| `backend npm run lint` | Failed: missing `lint` script. |
| `backend npm audit --omit=dev --json` | Failed: 13 production advisories, including 1 critical and 5 high. |
| `backend npm run start:prod` | Failed at DB connection: `getaddrinfo ENOTFOUND rootsegypt_database-egyptroots`. |
| `frontend npm test -- --run` | Failed: no Vitest test files found. |
| `frontend npm run lint` | Passed. |
| `frontend npm run build` | Passed with chunk-size warning. |
| `frontend npm audit --omit=dev --json` | Failed: 8 production advisories, including 1 critical and 4 high. |
| Browser Use | Partial: local homepage loaded once; multi-route DOM/screenshot audit was blocked by Browser Use runtime instability. |

## Blocked Coverage

- Local backend API, auth, authorization, uploads, static file serving, migrations, schema repair, and DB failure scenarios are blocked until local DB configuration is reachable.
- Production authenticated user/admin/super-admin flows are blocked until production API routing is restored and valid test credentials are provided.
- Production upload/download validation is blocked until public/item routes are reachable.
- Full Browser Use desktop/mobile visual validation is blocked by Browser Use runtime instability in this session. Direct route fetches covered SPA availability but not responsive layout or console behavior across all pages.

## Recommended Next Steps

1. Restore production API routing and confirm `GET https://api.rootsegypt.org/api/health/live` returns JSON 200.
2. Provide a local DB-compatible `.env` or local Docker DB recipe, then rerun backend runtime, auth, upload, and role tests.
3. Patch critical/high dependency advisories and rerun build/test/audit.
4. Add minimum backend/frontend smoke tests so CI does not report success with no executable tests.
5. Rerun Browser Use after API routing and browser runtime are healthy, with desktop and mobile viewport passes.
