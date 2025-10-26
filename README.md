# RashtraTimes Monorepo

A TurboRepo-powered newsroom platform featuring a Next.js App Router front-end and a NestJS API.

## Stack Highlights

- **apps/web** — Next.js 14 with Tailwind CSS, shadcn/ui, React Query, and newsroom workflows.
- **apps/api** — NestJS 10 with Prisma, PostgreSQL, JWT auth, RBAC, Swagger docs, and newsroom state machine.
- **packages/types** — Shared zod schemas, API client, and upload contracts published as `@rt/types`.
- Turborepo + pnpm workspaces for incremental builds, linting, and testing.

## Quick Start

```bash
pnpm install
cp .env.example .env.local
pnpm db:reset
pnpm dev
```

### Useful Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run both apps in development via Turbo (Next.js on 3000, API on 3333). |
| `pnpm build` | Build all packages and apps. |
| `pnpm lint` | Lint using the shared ESLint config. |
| `pnpm test` | Run unit/integration tests (Jest + Vitest). |
| `pnpm prisma:migrate -- init` | Apply the initial Prisma migration. |
| `pnpm prisma:seed` | Seed reporters, editors, publisher, admin, and sample articles. |
| `pnpm db:reset` | Reset database and reseed demo data. |

### API Service

```bash
cd apps/api
pnpm start:dev
# Swagger at http://localhost:3333/docs
# Health check at http://localhost:3333/health
```

### Web Service

```bash
cd apps/web
pnpm dev
# App served at http://localhost:3000
```

## Prisma

- Schema lives in `apps/api/prisma/schema.prisma`.
- Apply migrations: `pnpm -w prisma migrate dev --name init`.
- Seed data: `pnpm -w prisma db seed`.

## Docker

- `apps/web/Dockerfile` and `apps/api/Dockerfile` build production images.
- `docker-compose up` boots Postgres, Redis, MinIO, API, and Web locally.
- `scripts/backup.sh` dumps the configured Postgres database.

## Continuous Delivery

- `.github/workflows/ci.yml` runs lint/build/test for PRs and main pushes.
- `.github/workflows/deploy.yml` deploys web to Vercel and API to Fly.io, followed by a smoke check.

## Environments

Sample environment presets are available under `/env` for dev, staging, and prod. Update secrets before deploying.

## QA Checklist

See [`QA_CHECKLIST.md`](./QA_CHECKLIST.md) for end-to-end validation covering auth roles, citizen intake, media uploads, homepage slots, ads, sitemap, and swipe mode.
