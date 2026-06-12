# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

- `byu_i_pre_health_advisor_app.html` — original single-file prototype (reference only)
- `webapp/` — production Next.js application (work here)

## Development Commands

All commands run from `webapp/`:

```bash
npm run dev          # start dev server at http://localhost:3000
npm run build        # production build
npm run db:seed      # seed the database with demo users
npm run db:migrate   # run Prisma migrations
npm run db:studio    # open Prisma Studio (visual DB browser)
```

## Stack

- **Framework**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Database**: SQLite (dev) → Azure SQL / MS SQL Server (production)
- **ORM**: Prisma 7 with `@prisma/adapter-libsql` driver adapter
- **Auth**: NextAuth v4 with credentials provider (→ Entra ID SSO for production)
- **Hosting target**: Azure App Service

## Architecture

### Prisma 7 — Important Differences

Prisma 7 requires a driver adapter — no direct connection strings in the client constructor. All runtime DB access goes through `lib/prisma.ts` which wires up `PrismaLibSql`:

```ts
import { PrismaLibSql } from "@prisma/adapter-libsql";
const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
```

The generated client lives at `app/generated/prisma/client` (not `@prisma/client`). Always import from there. The `prisma.config.ts` in the project root configures the CLI/migrations; `lib/prisma.ts` configures the runtime client.

### Next.js 16 — Important Differences

- Route protection uses `proxy.ts` (not `middleware.ts` — that convention is deprecated in v16)
- The `proxy.ts` file uses `withAuth` from `next-auth/middleware` and the `matcher` config to protect `/advisor`, `/student`, and `/admin` routes

### Auth & Roles

Three roles stored as strings on the `User` model: `ADMIN`, `ADVISOR`, `STUDENT`. Role is injected into the JWT in `lib/auth.ts` callbacks and available on `session.user.role`. The `proxy.ts` file enforces role-based redirects server-side.

### Key Files

| File | Purpose |
|------|---------|
| `lib/auth.ts` | NextAuth config, JWT/session callbacks, credentials provider |
| `lib/prisma.ts` | Singleton Prisma client with libsql adapter |
| `proxy.ts` | Route protection + role-based access control |
| `prisma/schema.prisma` | DB schema: User, StudentProfile, AdvisorNote, School, AuditLog |
| `prisma/seed.ts` | Creates demo Admin, Advisor, and Student accounts |
| `app/generated/prisma/` | Auto-generated Prisma client — never edit manually |

### FERPA Compliance Design

- All `/advisor`, `/student`, `/admin` routes require authentication (enforced by `proxy.ts`)
- `AuditLog` table records every action taken on student records (action, resource, resourceId, userId, ipAddress, timestamp)
- Student data is never exposed client-side without a valid server session
- For production: Azure SQL with encryption at rest, Azure App Service with HTTPS enforced, Entra ID SSO replaces the credentials provider

### Switching to Production Database (Azure SQL)

1. Replace `@prisma/adapter-libsql` with `@prisma/adapter-mssql`
2. Update `datasource.provider` in `prisma/schema.prisma` to `sqlserver`
3. Update `DATABASE_URL` in Azure App Service environment variables
4. Run `npm run db:migrate`

### Seed Credentials (dev only)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@byui.edu | changeme123 |
| Advisor | advisor@byui.edu | changeme123 |
| Student | student@byui.edu | changeme123 |

BYU-I brand color: `#3063A5`
