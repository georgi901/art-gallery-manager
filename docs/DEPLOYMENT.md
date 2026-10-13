# Deployment

## Local Node.js

1. Copy `.env.example` to `.env`.
2. Set `DB_USER`, `DB_PASSWORD`, `DB_CONNECT_STRING` and a `JWT_SECRET` with at least 32 characters.
3. Install dependencies with `npm ci`.
4. Initialize Oracle with `npm run db:setup`.
5. Create the first administrator with `npm run create-admin`.
6. Start the application with `npm start`.

The application is available at `http://localhost:3000`.

## Docker Compose

Docker Compose starts the Node.js application and an Oracle XE container:

```bash
cp .env.example .env
# Set ORACLE_PASSWORD, DB_PASSWORD, ADMIN_PASSWORD and JWT_SECRET in .env
docker compose up --build
```

The Oracle data and uploaded images are stored in named volumes. The first
startup may take several minutes while Oracle initializes.

After the database is healthy, initialize the schema and demo data:

```bash
docker compose exec app npm run db:setup
docker compose exec app npm run create-admin
```

Do not use `npm run db:reset` against a production database.

## CI

GitHub Actions runs dependency installation, formatting, ESLint and Jest with
coverage. Oracle integration tests remain skipped unless database credentials
are supplied to the workflow.
