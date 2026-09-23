---
name: Wallet Witness architecture
description: Non-obvious decisions and gotchas for the Wallet Witness buildathon app
---

## Non-obvious decisions

**Mock-first, live on key presence:** `isNansenConfigured()` gates all Nansen calls. Without `NANSEN_API_KEY`, the app serves mock data. No silent empty states.

**Cache-first clue unlocking:** Fetched clues are written to the `clues` table. Repeat calls to the same `(caseId, clueIndex)` return from DB, not Nansen — prevents accidental credit burns.

**Why scoring is complex:** correctBonus(60) + speedBonus(0-30 linear on clues used) + confidenceBonus(0-10 if correct+confident) + confidencePenalty(0 to -20 if wrong+overconfident).

## Nansen API — required parameters (discovered in production)

- All `profiler/address/*` endpoints require `date: { from: "YYYY-MM-DD", to: "YYYY-MM-DD" }` or return 422.
- `address/current-balance` returns 404 — path does not exist on Nansen API v1. Replaced with `profiler/address/pnl-summary` for the balance clue.
- `token-screener` costs more than 1 credit per call — do not use it for budget-controlled runs.
- Rolling 365-day window: `new Date(Date.now() - 365*24*60*60*1000).toISOString().slice(0,10)` to today.
- The `dateRange()` helper in `artifacts/api-server/src/lib/nansen.ts` encapsulates this.

## Known gotchas

- `db.$count` does not exist in Drizzle — use `sql<number>\`cast(count(*) as int)\`` instead.
- `@radix-ui/react-icons` must be an explicit dep in `wallet-witness` (not inferred from scaffold).
- `lib/api-client-react/tsconfig.json` must include `"dom.iterable"` in lib or codegen typecheck fails.
- Seed script (`scripts/collect-nansen-data.mjs`) uses only `profiler/address/pnl-summary` with date range — confirmed 1 credit per call.
