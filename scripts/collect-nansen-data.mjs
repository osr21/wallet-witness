/**
 * Wallet Witness — Nansen API 1,000-Call Seed Script
 *
 * Alternates between profiler/address/related-wallets and
 * profiler/address/pnl-summary (both 1 credit per call).
 * Rotates through 30 well-known Ethereum wallet addresses for data variety.
 *
 * Usage (fresh run):
 *   NANSEN_API_KEY=your_key node scripts/collect-nansen-data.mjs
 *
 * Resume from a partial run — the script auto-reads the last call_number
 * from the existing JSONL and continues from there:
 *   TARGET_CALLS=343 NANSEN_API_KEY=your_key node scripts/collect-nansen-data.mjs
 *
 * Rate: 4 calls/second — ~4 min 10s for 1,000 calls.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.NANSEN_API_KEY;
if (!API_KEY) {
  console.error("NANSEN_API_KEY environment variable is required.");
  process.exit(1);
}

const TARGET_CALLS = parseInt(process.env.TARGET_CALLS || "1000", 10);
const BASE_URL = "https://api.nansen.ai/api/v1";
const OUTPUT_FILE = path.join(__dirname, "..", "nansen-api-results.jsonl");
const DELAY_MS = 250; // 4 req/s
const CHAIN = "ethereum";

// Auto-derive call offset from the last call_number in the existing JSONL.
// This ensures resumed runs produce contiguous call_numbers without manual env vars.
async function deriveCallOffset() {
  try {
    const content = await fs.readFile(OUTPUT_FILE, "utf-8");
    const lines = content.trim().split("\n").filter(Boolean);
    if (lines.length === 0) return 0;
    const last = JSON.parse(lines[lines.length - 1]);
    const n = Number(last.call_number);
    if (!Number.isFinite(n) || n < 0) return 0;
    console.log(`Resuming from call_number ${n} (${lines.length} existing entries).`);
    return n;
  } catch {
    return 0; // File doesn't exist yet — fresh run
  }
}
const CALL_OFFSET = await deriveCallOffset();

// 1-credit endpoints confirmed working.
// "profiler/address/related-wallets" — no date required.
// "profiler/address/pnl-summary"     — requires date range.
const ENDPOINTS = [
  { path: "profiler/address/related-wallets", needsDate: false },
  { path: "profiler/address/pnl-summary",     needsDate: true  },
  { path: "profiler/address/related-wallets", needsDate: false },
  { path: "profiler/address/pnl-summary",     needsDate: true  },
  { path: "profiler/address/related-wallets", needsDate: false },
  { path: "profiler/address/pnl-summary",     needsDate: true  },
];

// Date range: last 365 days (required by profiler/address/pnl-summary)
const to = new Date().toISOString().slice(0, 10);
const fromDate = new Date();
fromDate.setFullYear(fromDate.getFullYear() - 1);
const from = fromDate.toISOString().slice(0, 10);
const DATE_RANGE = { from, to };

// Well-known Ethereum addresses for data variety
const ADDRESSES = [
  "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", // Vitalik
  "0x3DdfA8eC3052539b6C9549F12cEA2C295cfF5296",
  "0x28C6c06298d514Db089934071355E5743bf21d60",
  "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
  "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",
  "0x7e2a2FA2a064F693f0a55C5831279F8A34D7Bc4d",
  "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
  "0x1db3439a222c519ab44bb1144fC28167b4Fa6EE6",
  "0x4862733B5FdDFd35f35ea8CCf08F5045e57388B3",
  "0xf977814e90dA44bFA03b6295A0616a897441aceC",
  "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "0x267be1C1D684F78cb4F6a176C4911b741E4Ffdc0",
  "0x0A869d79a7052C7f1b55a8EbAbbEa3420F0D1E13",
  "0xE853c56864A2ebe4576a807D26Fdc4A0adA51919",
  "0xDa9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
  "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
  "0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98",
  "0x6F46CF5569AEfA1acC1009290c8E043747172d89",
  "0x236F9F97e0E62388479bf9E5BA4889e46B0273C3",
  "0x9BF4001d307dFd62B26A2F1307ee0C0307632d59",
  "0xA7EFAe728D2936e78BDA97dc267687568dD593f3",
  "0x4bb7d80282f5e0616705d7f832acfc59f89f7091",
  "0xd387a6e4e84a6c86bd90c158c6028a58cc8ac459",
  "0xd275e5cb559d6dc236a5f8002a5f0b4c8e610701",
  "0x8103683202aa8da10536036edef04cdd865c225E",
  "0x220866B1A2219f40e72f5c628B65D54268cA3A9D",
  "0xc61b9bb3a7a0767e3179713f3A5c7a9aeDce193C",
  "0x60FaAe176336dAb62e284Fe19B885B095d29fB7F",
  "0x77134cbC06cB00b66F4c7e623D5fdBF6777635EC",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let successful = 0;
let consecutiveFailures = 0;
const startTime = Date.now();

console.log(`\nWallet Witness — Nansen API Call Collector`);
console.log(`Endpoints: profiler/address/related-wallets + profiler/address/pnl-summary (1 credit each)`);
console.log(`Target: ${TARGET_CALLS} successful calls (offset: ${CALL_OFFSET})`);
console.log(`Date range: ${DATE_RANGE.from} → ${DATE_RANGE.to}`);
console.log(`Output: ${OUTPUT_FILE}\n`);

while (successful < TARGET_CALLS) {
  const ep = ENDPOINTS[successful % ENDPOINTS.length];
  const address = ADDRESSES[successful % ADDRESSES.length];
  const requestBody = ep.needsDate
    ? { address, chain: CHAIN, date: DATE_RANGE }
    : { address, chain: CHAIN };

  const response = await fetch(`${BASE_URL}/${ep.path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
    },
    body: JSON.stringify(requestBody),
  });

  if (response.ok) {
    const data = await response.json();
    await fs.appendFile(
      OUTPUT_FILE,
      JSON.stringify({
        call_number: CALL_OFFSET + successful + 1,
        collected_at: new Date().toISOString(),
        endpoint: ep.path,
        address,
        chain: CHAIN,
        date: DATE_RANGE,
        data,
      }) + "\n",
    );

    successful++;
    consecutiveFailures = 0;

    if (successful % 50 === 0 || successful === TARGET_CALLS) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const pct = Math.round((successful / TARGET_CALLS) * 100);
      const eta = successful < TARGET_CALLS
        ? Math.round(((Date.now() - startTime) / successful) * (TARGET_CALLS - successful) / 1000)
        : 0;
      console.log(`[${pct}%] ${successful}/${TARGET_CALLS} — ${elapsed}s elapsed${eta ? ` — ~${eta}s remaining` : ""}`);
    }
  } else {
    const message = await response.text().catch(() => "");
    consecutiveFailures++;
    console.error(`Call ${successful + 1} failed: ${response.status} ${message}`);

    if (response.status === 429) {
      console.log("Rate limit — waiting 10 seconds...");
      await sleep(10_000);
      consecutiveFailures = 0;
    } else if (response.status === 402 || response.status === 403) {
      console.error("Stopped: insufficient credits or invalid API key.");
      process.exit(1);
    } else if (consecutiveFailures >= 5) {
      console.error("Stopped after 5 consecutive failures.");
      process.exit(1);
    }
  }

  await sleep(DELAY_MS);
}

const totalTime = ((Date.now() - startTime) / 1000).toFixed(0);
console.log(`\n✅ Done! ${successful} calls in ${totalTime}s → ${OUTPUT_FILE}`);
