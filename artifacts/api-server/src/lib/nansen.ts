import { db } from "@workspace/db";
import { apiCallLogTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

const BASE_URL = "https://api.nansen.ai/api/v1";

/** Rolling 365-day date range — required by most profiler endpoints */
function dateRange() {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  return { from, to };
}

async function logCall(
  endpoint: string,
  walletAddress?: string,
  chain?: string,
  success = true,
): Promise<void> {
  try {
    await db.insert(apiCallLogTable).values({
      endpoint,
      walletAddress,
      chain,
      creditsUsed: 1,
      success,
    });
  } catch (err) {
    logger.warn({ err }, "Failed to log Nansen API call");
  }
}

async function nansenPost<T>(
  endpoint: string,
  body: Record<string, unknown>,
  walletAddress?: string,
  chain?: string,
): Promise<T> {
  const apiKey = process.env.NANSEN_API_KEY;
  if (!apiKey) {
    throw new Error("NANSEN_API_KEY is not configured");
  }

  const response = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: apiKey,
    },
    body: JSON.stringify(body),
  });

  const success = response.ok;
  await logCall(endpoint, walletAddress, chain, success);

  if (!response.ok) {
    const text = await response.text().catch(() => "unknown error");
    logger.error({ endpoint, status: response.status, body: text }, "Nansen API error");
    throw new Error(`Nansen API ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

export function isNansenConfigured(): boolean {
  return !!process.env.NANSEN_API_KEY;
}

/** Clue 1: Current portfolio balance */
export async function getWalletBalance(address: string, chain: string) {
  // address/current-balance is the canonical holdings endpoint.
  // If it is unavailable (404), nansenPost throws and the route handler
  // catches with a balance-shaped fallback — do NOT substitute pnl-summary
  // here, as that returns P&L fields rather than holdings fields.
  return nansenPost(
    "address/current-balance",
    { address, chain },
    address,
    chain,
  );
}

/** Clue 2: PnL summary (win rate, realized profit) */
export async function getWalletPnlSummary(address: string, chain: string) {
  return nansenPost(
    "profiler/address/pnl-summary",
    { address, chain, date: dateRange() },
    address,
    chain,
  );
}

/** Clue 3: Token-level PnL */
export async function getWalletPnl(address: string, chain: string) {
  return nansenPost(
    "profiler/address/pnl",
    { address, chain, date: dateRange() },
    address,
    chain,
  );
}

/** Clue 4: Transaction history */
export async function getWalletTransactions(address: string, chain: string) {
  return nansenPost(
    "profiler/address/transactions",
    { address, chain, date: dateRange() },
    address,
    chain,
  );
}

/** Clue 5: DEX trade history */
export async function getWalletDexTrades(address: string, chain: string) {
  return nansenPost(
    "profiler/dex-trades",
    { address, chain, date: dateRange() },
    address,
    chain,
  );
}

/** Clue 6: Related wallets / counterparties */
export async function getWalletRelatedWallets(address: string, chain: string) {
  return nansenPost(
    "profiler/address/related-wallets",
    { address, chain, date: dateRange() },
    address,
    chain,
  );
}

export async function getTotalNansenCalls(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(apiCallLogTable);
  return row?.count ?? 0;
}
