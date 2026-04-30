# RootsEgypt-full-SourceCode

## Backend deployment

EasyPanel production deploys should use:

- Build context: `backend`
- Dockerfile path: `backend/Dockerfile`
- Runtime config precedence: host-injected environment variables, then `backend/.env`

Recommended DB contract:

- `DATABASE_URL`

Or the canonical split variables:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Compatibility aliases are also accepted by the backend runtime and Knex entrypoints:

- `MYSQL_URL`
- `MYSQL_URI`
- `DB_URL`
- `MYSQL_*`
- `DATABASE_*`

The backend uses a single on-disk env file: `backend/.env`.
