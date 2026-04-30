# RootsEgypt-full-SourceCode

## Backend deployment

EasyPanel production deploys should use:

- Build context: `backend`
- Dockerfile path: `backend/Dockerfile`
- Runtime secrets source: host-injected environment variables

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

Committed `.env` files are for local development only and should not be relied on in production containers.
