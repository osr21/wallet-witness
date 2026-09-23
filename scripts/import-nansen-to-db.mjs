/**
 * Wallet Witness — Import JSONL results into api_call_log table
 *
 * Run after collect-nansen-data.mjs finishes:
 *   node scripts/import-nansen-to-db.mjs
 *
 * Idempotent: clears all existing token-screener rows, then re-inserts
 * every line from nansen-api-results.jsonl in call_number order.
 * Source-of-truth is always the JSONL file — running twice produces the
 * same result.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JSONL = path.join(__dirname, "..", "nansen-api-results.jsonl");

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const raw = await fs.readFile(JSONL, "utf-8");
  const lines = raw.trim().split("\n").filter(Boolean);
  console.log(`Read ${lines.length} entries from ${JSONL}`);

  // Parse and validate every entry
  const entries = lines.map((line, idx) => {
    const e = JSON.parse(line);
    if (!e.call_number || e.call_number !== idx + 1) {
      throw new Error(
        `call_number mismatch at line ${idx + 1}: got ${e.call_number}`
      );
    }
    return {
      callNumber: e.call_number,
      chain: e.chain ?? null,
      calledAt: e.collected_at,
    };
  });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Clear existing token-screener rows so the import is idempotent
    const { rowCount: deleted } = await client.query(
      "DELETE FROM api_call_log WHERE endpoint = 'token-screener'"
    );
    console.log(`Cleared ${deleted} existing token-screener rows`);

    // Bulk insert in batches of 250
    const BATCH = 250;
    let inserted = 0;
    for (let i = 0; i < entries.length; i += BATCH) {
      const batch = entries.slice(i, i + BATCH);
      const values = batch
        .map(
          (_, j) =>
            `($${j * 3 + 1}, $${j * 3 + 2}, $${j * 3 + 3}, 1, true)`
        )
        .join(", ");
      const params = batch.flatMap((r) => ["token-screener", r.chain, r.calledAt]);
      await client.query(
        `INSERT INTO api_call_log (endpoint, chain, called_at, credits_used, success) VALUES ${values}`,
        params
      );
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${entries.length} rows...`);
    }

    await client.query("COMMIT");
    console.log(`\n✅ Done! ${inserted} rows in api_call_log (token-screener).`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  const { rows } = await pool.query(
    "SELECT COUNT(*) AS cnt FROM api_call_log"
  );
  console.log(`Total api_call_log rows now: ${rows[0].cnt}`);

  await pool.end();
}

main().catch((err) => {
  console.error("Import failed:", err);
  process.exit(1);
});
