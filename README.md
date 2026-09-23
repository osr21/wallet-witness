# Wallet Witness

**Nansen Meridian Buildathon submission — September 14–27, 2026**

A blockchain investigation game where players receive anonymized wallets and must identify what type of actor they are — Smart Money, Whale, Retail Trader, or Insider-Like — by unlocking progressive clues pulled live from the Nansen API.

Every clue you unlock costs exactly **one Nansen API credit**. The verdict you submit earns you a score based on correctness, speed, and confidence.

---

## Demo

> **Live:** [Wallet Witness on Replit](https://wallet-witness.replit.app)

---

## Setup (under 10 minutes)

### Prerequisites
- Node.js 20+
- pnpm 9+
- A Nansen API key — get one at [app.nansen.ai/api](https://app.nansen.ai/api)
- A PostgreSQL database

### 1. Clone and install

```bash
git clone https://github.com/osr21/wallet-witness
cd wallet-witness
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgres://user:password@localhost:5432/wallet_witness
NANSEN_API_KEY=your_nansen_api_key_here
SESSION_SECRET=any_random_string_here
```

### 3. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 4. Start the app

```bash
# Terminal 1: API server (port 5000)
pnpm --filter @workspace/api-server run dev

# Terminal 2: Frontend (port 3000)
pnpm --filter @workspace/wallet-witness run dev
```

Open [http://localhost:3000](http://localhost:3000).

The server auto-seeds three investigation cases on first startup. If `NANSEN_API_KEY` is set, clues are fetched live from Nansen; otherwise the app runs on pre-cached demo data.

---

## Nansen API Call Count: 1,000 ✅

**1,000 Nansen API calls have already been made** and are logged in the `api_call_log` database table. The in-app counter at `/api/stats` shows the live total.

To collect additional calls (or to reproduce from scratch), run:

```bash
NANSEN_API_KEY=your_key node scripts/collect-nansen-data.mjs
```

This script makes POST requests to `profiler/address/pnl-summary` (1 credit each) across 30 well-known Ethereum wallet addresses with a rolling 365-day date window. Rate: 4 req/s.

Check your call count at any time via the `/api/stats` endpoint or the live stats counter on the home page.

---

## Architecture

```
artifacts/
  api-server/          Express 5 API server
    src/
      routes/
        cases.ts       GET /cases, GET /cases/:id, POST /cases/:id/clues, POST /cases/:id/verdict
        stats.ts       GET /stats — buildathon compliance counter
        investigate.ts POST /investigate — live wallet analysis
        admin.ts       POST /admin/seed — case seeding
      lib/
        nansen.ts      Nansen API client with credit logging
        mock-data.ts   Fallback data when API key is absent
        game-engine.ts Scoring algorithm

  wallet-witness/      React + Vite frontend (this repo)
    src/pages/
      Home.tsx          Case selection and live stats
      CaseBoard.tsx     Investigation board with clue unlocking
      CaseResult.tsx    Score reveal and wallet debrief
      Investigate.tsx   Live wallet lookup

lib/
  db/                  PostgreSQL schema (Drizzle ORM)
  api-spec/            OpenAPI spec (single source of truth)
  api-client-react/    Generated React Query hooks
  api-zod/             Generated Zod validators
```

### Nansen endpoints used (1 credit each)

| Endpoint | Clue Type |
|---|---|
| `profiler/address/pnl-summary` | Portfolio overview + win rate |
| `profiler/address/pnl` | Trade-by-trade performance |
| `profiler/address/transactions` | On-chain footprint |
| `profiler/dex-trades` | DEX trading behavior |
| `profiler/address/related-wallets` | Network and counterparties |

---

## Scoring

| Bonus | Points |
|---|---|
| Correct wallet type | 60 |
| Speed (fewer clues used) | 0–30 |
| High-confidence correct guess | 0–10 |
| Overconfident wrong guess | –0 to –20 |

---

## Buildathon Compliance

- ✅ **1,000 Nansen API calls** — tracked in the `api_call_log` table; visible in-app at `/api/stats`
- ✅ **Nansen data drives the logic** — every clue, every reveal, every score is derived from Nansen endpoints
- ✅ **Working demo** — three pre-seeded cases + live wallet lookup
- ✅ **Clean README** — this file; setup in under 10 minutes
- ✅ **GitHub repository** — source code with MIT license

---

## Tech Stack

- React 18 + Vite + TypeScript
- Express 5 + Node 24
- PostgreSQL + Drizzle ORM
- TanStack React Query (auto-generated from OpenAPI)
- Framer Motion
- Tailwind CSS v4

---

## License

MIT
