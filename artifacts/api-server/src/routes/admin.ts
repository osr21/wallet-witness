import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import { casesTable, cluesTable } from "@workspace/db";
import { MOCK_CASES, CLUE_CONFIGS, getMockClueData } from "../lib/mock-data";
import {
  isNansenConfigured,
  getWalletBalance,
  getWalletPnlSummary,
  getWalletPnl,
  getWalletTransactions,
  getWalletDexTrades,
  getWalletRelatedWallets,
} from "../lib/nansen";
import { logger } from "../lib/logger";

const router: IRouter = Router();

async function fetchClueData(
  clueType: string,
  walletAddress: string,
  chain: string,
  walletTypeForMock: string,
): Promise<{ data: Record<string, unknown>; fromNansen: boolean }> {
  if (!isNansenConfigured()) {
    return {
      data: getMockClueData(walletTypeForMock, clueType),
      fromNansen: false,
    };
  }

  try {
    const fetchers: Record<string, () => Promise<unknown>> = {
      balance: () => getWalletBalance(walletAddress, chain),
      pnl_summary: () => getWalletPnlSummary(walletAddress, chain),
      pnl: () => getWalletPnl(walletAddress, chain),
      transactions: () => getWalletTransactions(walletAddress, chain),
      dex_trades: () => getWalletDexTrades(walletAddress, chain),
      related_wallets: () => getWalletRelatedWallets(walletAddress, chain),
    };
    const fetcher = fetchers[clueType];
    const data = (fetcher ? await fetcher() : {}) as Record<string, unknown>;
    return { data, fromNansen: true };
  } catch {
    return {
      data: getMockClueData(walletTypeForMock, clueType),
      fromNansen: false,
    };
  }
}

export async function seedAllCases(force = false): Promise<{
  casesSeeded: number;
  cluesCached: number;
  nansenCallsMade: number;
}> {
  if (force) {
    await db.delete(cluesTable);
    await db.delete(casesTable);
  }

  let casesSeeded = 0;
  let cluesCached = 0;
  let nansenCallsMade = 0;

  for (const caseData of MOCK_CASES) {
    // Skip if already exists (unless force)
    const existing = await db
      .select({ id: casesTable.id })
      .from(casesTable)
      .where(eq(casesTable.walletAddress, caseData.walletAddress));

    if (existing.length > 0 && !force) continue;

    const [inserted] = await db
      .insert(casesTable)
      .values({ ...caseData, totalClues: CLUE_CONFIGS.length })
      .returning();

    casesSeeded++;

    for (let i = 0; i < CLUE_CONFIGS.length; i++) {
      const config = CLUE_CONFIGS[i]!;
      const { data, fromNansen } = await fetchClueData(
        config.clueType,
        caseData.walletAddress,
        caseData.chain,
        caseData.walletType,
      );

      if (fromNansen) nansenCallsMade++;

      await db.insert(cluesTable).values({
        caseId: inserted.id,
        clueIndex: i,
        clueType: config.clueType,
        title: config.title,
        hint: config.hint,
        nansenEndpoint: config.nansenEndpoint,
        data,
      });

      cluesCached++;
    }

    logger.info({ caseId: inserted.id, title: caseData.title }, "Seeded case");
  }

  return { casesSeeded, cluesCached, nansenCallsMade };
}

router.post("/admin/seed", async (req, res): Promise<void> => {
  const { force } = req.body as { force?: boolean };
  const result = await seedAllCases(force === true);
  res.json({
    ...result,
    message: `Seeded ${result.casesSeeded} cases with ${result.cluesCached} clues (${result.nansenCallsMade} live Nansen calls)`,
  });
});

export default router;
