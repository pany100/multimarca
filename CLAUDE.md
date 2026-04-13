# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role

You extend and maintain the **automotive workshop management** app: repair orders, clients, vehicles, stock, budgets, WhatsApp, scheduling, HR, and related flows. Prefer **small, focused changes** that match existing patterns.

**Dependency direction:** `app/` (routes, UI) -> `core/application` -> `core/domain`; `core/infrastructure` implements domain ports and external services. Do not import infrastructure from domain.

## Monorepo

- Root package name: `taller` (`package.json` workspaces: `apps/*`, `packages/*/*`, `packages/shared/*`).
- **Primary codebase:** `apps/web` (npm package `multimarca`). Run all app commands from `apps/web` unless noted.
- `packages/` contains placeholder directories — all production code lives in `apps/web/src/`.

## Stack (versions in `apps/web/package.json`)

- **Runtime / app:** Next.js 14.2.5, React 18, TypeScript 5, App Router, custom server (`tsx server.ts`, production `dist/server.js`).
- **UI:** MUI 5, Emotion, Data Grid / Date Pickers.
- **Data:** Prisma 5, **MySQL** (`apps/web/prisma/schema.prisma`).
- **Validation:** Zod (API / DTOs); Formik + Yup in some client forms; `formV2/` components use React Hook Form.
- **Tests:** Jest, `ts-jest`; test DB via `setup-test-db`.
- **Other:** Socket.io, AWS S3 SDK, Puppeteer, JWT/jose, Winston (root dep), node-cron, Anthropic SDK (WhatsApp AI filter).

## Commands (from `apps/web`)

```bash
cd apps/web

npm run dev              # dev server (tsx server.ts)
npm run lint             # next lint
npm run test             # yarn setup-test-db && jest --runInBand
npm run build            # next build + compile server (prebuild)
npm start                # production: node dist/server.js

# Run a single test file
npm test -- --testPathPattern=tests/app/api/auth/login/route.test.ts

# Run tests matching a describe/it name
npm test -- --testNamePattern="should return 200"
```

Prisma (run inside `apps/web`):

```bash
npx prisma generate
npx prisma migrate dev
npx prisma studio
npx prisma db seed       # seed script: tsx prisma/seed.ts
```

## Architecture

### Layout

| Path | Purpose |
|------|---------|
| `apps/web/src/app` | App Router pages, layouts, `api/**/route.ts` |
| `apps/web/src/app/dashboard/` | 67+ feature pages (`[feature]/`, `[feature]/[id]`, `[feature]/nueva`) |
| `apps/web/src/core/domain` | Entities, repository interfaces, value objects, policies, domain services |
| `apps/web/src/core/application` | Use cases, DTOs, mappers, application services |
| `apps/web/src/core/infrastructure` | Prisma repos, Zod schemas, external adapters, query services |
| `apps/web/src/components` | Shared UI: `CrudTable`, `DynamicForm`, `formV2/`, `tableV2/`, feature-specific folders |
| `apps/web/src/shared` | Cross-cutting middleware (`error-handler`, `validation`) |
| `apps/web/src/cron` | Scheduled jobs (backup, dolar rates, WhatsApp, birthdays, payment reminders) |
| `apps/web/src/lib` | Singletons: `socketio.ts` (`getIO()`), `logger.ts` (Winston) |
| `apps/web/prisma` | `schema.prisma`, migrations, seed |
| `apps/web/tests` | Jest tests, mirrors `src/app/api/` structure |

### Key entry points

- **Ordenes de reparación — editing/admin:** The primary page for viewing and editing an order is `apps/web/src/app/dashboard/ordenes-reparacion/[id]/page.tsx`. This page uses inline-editable sections (via `CommonOrderCard` + PATCH endpoints) and an `OrdenContext`. Always start here when working on OdR features — trace imports to find the relevant section component under `src/sections/ordenes-reparacion/admin/`.

> **⚠ `src/components/orden-reparacion/formV2/` is obsolete — do NOT modify.** These components are pending removal. The source of truth for OdR UI is `src/sections/ordenes-reparacion/admin/` and the page at `src/app/dashboard/ordenes-reparacion/[id]/`.

### Domain layer patterns

- **Value Objects:** `Money` (wraps `Prisma.Decimal`), `DateRange`, `OrdenReparacion`, `Presupuesto`, `Pago`, `EstadosOrden`, etc.
- **Repository interfaces:** 40+ contracts (e.g., `OrdenReparacionRepository`, `StockRepository`). Infrastructure implements them as `prisma-*.repository.ts`.
- **Policies:** Business rules in `*.policy.ts` (e.g., `orden-reparacion.policy.ts`, `tareas-diarias.policy.ts`).
- **Domain services:** Factories/calculators for complex logic without persistence (e.g., `ComprobanteCalculadoFactory`).

### Application layer patterns

- **Use cases:** 42+ classes, one per operation. Pattern: `class FeatureUseCase { constructor(repo) {} async execute(dto) {} }`.
- **Application services:** Coordinate multiple repos/use cases for complex workflows. Distinct from domain services — these orchestrate, domain services calculate.
- **DTOs/Mappers:** Transfer objects per entity; mappers translate between domain models and DB/API representations.

### Infrastructure adapters (beyond Prisma repos)

- **WhatsApp:** Meta client, AI filter (Anthropic SDK with circuit breaker), PDF generator, phone normalizer, request signature guard.
- **Query services:** Specialized read models for statistics (mano de obra, mecanicos, transacciones, deudores, balance, etc.) — separate from CRUD repos.
- **S3:** File storage adapter.
- **Socket notifier:** Broadcasts real-time events via Socket.io singleton.
- **Dolar exchange:** External currency rate fetcher.
- **PDF:** Puppeteer-based document generation.

### Authentication

- **JWT-based stateless auth** using `jose` library (7-day token expiration).
- **Next.js middleware** (`middleware.ts`) validates tokens on 65+ protected route patterns.
- Middleware injects `x-user-id` and `x-user-email` headers into authorized requests.
- Session helper: `getSession()` reads JWT from cookies.
- Invalid/missing tokens return 401.

### Real-time & cron

- **Socket.io:** Initialized in custom `server.ts`; singleton via `getIO()` in `lib/socketio.ts`. Client hook: `useSocket()`.
- **Cron jobs:** Registered in `src/app/cron.ts` via `initCronJobs()`. Global flag prevents duplicate init. Uses `node-cron`.

## API pattern

1. Parse body/query; validate with Zod (`validateRequest` + schemas under `core/infrastructure/validation/schemas`).
2. Call a **use case** with a **Prisma repository** (or other adapter).
3. On failure, use `handleApiError` from `@/shared/middleware/error-handler.middleware`.

```typescript
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, someSchema);
    const result = await new SomeUseCase(new PrismaSomeRepository()).execute(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
```

### Error handling

`handleApiError()` maps errors to HTTP responses:
- `PrismaClientKnownRequestError` P2002 (unique constraint) -> 409
- `ZodError` -> 422
- Custom `Error` with "no encontrado" -> 404
- Default -> 400 or 500

All errors logged via Winston (`lib/logger.ts`). Error messages are in **Spanish**.

## Style

- Path alias: `@/` -> `src/`.
- New persistence: add or extend **repository** in infrastructure; wire **use case** in application; keep Prisma types out of domain when possible.
- **User-visible copy** (UI labels, API error messages) is predominantly **Spanish** — follow surrounding strings and product tone.

## Boundaries

| | |
|--|--|
| **Always** | Match existing patterns; validate inputs; use `handleApiError`; run `lint` / `test` when the change warrants it. |
| **Ask first** | Prisma migrations affecting production data, new major dependencies, CI/deploy config, ambiguous business rules. |
| **Never** | Commit secrets (`.env`, keys); edit `node_modules/`; bypass auth for "quick tests" in committed code. |

## Git

Follow team conventions; do not rewrite published history. Husky may run hooks on commit — keep changes lint-clean.
