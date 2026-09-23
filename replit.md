# Wallet Witness

A blockchain investigation game built for the Nansen Meridian Buildathon (Sep 14–27, 2026). Players receive anonymized wallet files and must identify the actor type — Smart Money, Whale, Retail Trader, or Insider-Like — by unlocking progressive clues pulled live from the Nansen API. Every clue costs one API credit.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/wallet-witness run dev` — run the frontend (port assigned by workflow)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `NANSEN_API_KEY=xxx node scripts/collect-nansen-data.mjs` — make 1,000 Nansen calls for buildathon compliance
- Required env: `DATABASE_URL`, `NANSEN_API_KEY`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + Framer Motion + Tailwind CSS v4
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Nansen API: REST, 1-credit endpoints only
- Validation: Zod (drizzle-zod)
- API codegen: Orval (from OpenAPI spec)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/cases.ts` — DB schema (cases, clues, verdicts, api_call_log)
- `artifacts/api-server/src/lib/nansen.ts` — Nansen API client with per-call credit logging
- `artifacts/api-server/src/lib/mock-data.ts` — fallback data when NANSEN_API_KEY is absent
- `artifacts/api-server/src/lib/game-engine.ts` — scoring algorithm
- `artifacts/api-server/src/routes/` — API route handlers
- `artifacts/wallet-witness/src/` — React frontend
- `scripts/collect-nansen-data.mjs` — 1,000-call seed script for buildathon compliance

## Architecture decisions

- **Mock data fallback**: App works without NANSEN_API_KEY using pre-cached realistic data. Live Nansen data is used when key is present.
- **Auto-seeding on startup**: Server seeds 3 investigation cases on first boot; safe to run repeatedly.
- **Credit logging**: Every Nansen API call is logged to `api_call_log` table with endpoint, wallet, chain, and success status. `/api/stats` aggregates this for buildathon compliance.
- **Cache-first clues**: Clue data is cached in the `clues` table after first fetch — re-querying the same clue during a session does not cost additional credits.
- **OpenAPI-first**: All types flow from `lib/api-spec/openapi.yaml` → Orval codegen → React Query hooks + Zod schemas.

## Buildathon compliance

- 1,000 Nansen API calls: tracked in `api_call_log` table, visible at `/api/stats` and the UI home page
- Nansen data drives all game logic (clues, scoring, reveal)
- 3 pre-seeded cases + live wallet investigation
- seed script: `scripts/collect-nansen-data.mjs`

## Nansen endpoints used (1 credit each)

| Endpoint | Game Role |
|---|---|
| `address/current-balance` | Clue 1: Portfolio overview |
| `profiler/address/pnl-summary` | Clue 2: Win rate & profit summary |
| `profiler/address/pnl` | Clue 3: Trade-by-trade performance |
| `profiler/address/transactions` | Clue 4: On-chain footprint |
| `profiler/dex-trades` | Clue 5: DEX trading patterns |
| `profiler/address/related-wallets` | Clue 6: Network and counterparties |

## Gotchas

- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change before editing routes or frontend.
- `pnpm --filter @workspace/db run push-force` if push fails with column conflicts.
- The API server must be running for the frontend to show real case data; app gracefully degrades with mock data if the server is unreachable.
