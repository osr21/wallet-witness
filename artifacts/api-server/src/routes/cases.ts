import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  casesTable,
  cluesTable,
  verdictTable,
} from "@workspace/db";
import {
  isNansenConfigured,
  getWalletBalance,
  getWalletPnlSummary,
  getWalletPnl,
  getWalletTransactions,
  getWalletDexTrades,
  getWalletRelatedWallets,
  getTotalNansenCalls,
} from "../lib/nansen";
import {
  CLUE_CONFIGS,
  getMockClueData,
} from "../lib/mock-data";
import {
  calculateScore,
  maskWalletAddress,
  WALLET_TYPE_LABELS,
  WALLET_TYPE_EXPLANATIONS,
} from "../lib/game-engine";

const router: IRouter = Router();

// GET /cases
router.get("/cases", async (_req, res): Promise<void> => {
  const cases = await db.select().from(casesTable).where(eq(casesTable.isActive, true));
  const result = cases.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    difficulty: c.difficulty,
    chain: c.chain,
    totalClues: c.totalClues,
    isActive: c.isActive,
    completedCount: c.completedCount,
    walletAddressMasked: maskWalletAddress(c.walletAddress),
  }));
  res.json(result);
});

// GET /cases/:id
router.get("/cases/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid case id" });
    return;
  }

  const [caseRow] = await db.select().from(casesTable).where(eq(casesTable.id, id));
  if (!caseRow) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  const clues = await db
    .select()
    .from(cluesTable)
    .where(eq(cluesTable.caseId, id));

  res.json({
    id: caseRow.id,
    title: caseRow.title,
    description: caseRow.description,
    difficulty: caseRow.difficulty,
    chain: caseRow.chain,
    totalClues: caseRow.totalClues,
    walletAddressMasked: maskWalletAddress(caseRow.walletAddress),
    narrative: caseRow.narrative,
    unlockedClues: clues
      .sort((a, b) => a.clueIndex - b.clueIndex)
      .map((c) => ({
        clueIndex: c.clueIndex,
        clueType: c.clueType,
        title: c.title,
        hint: c.hint,
        nansenEndpoint: c.nansenEndpoint,
        data: c.data,
      })),
  });
});

// POST /cases/:id/clues
router.post("/cases/:id/clues", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid case id" });
    return;
  }

  const { clueIndex, sessionId } = req.body as { clueIndex: number; sessionId: string };
  if (clueIndex === undefined || !sessionId) {
    res.status(400).json({ error: "clueIndex and sessionId are required" });
    return;
  }

  const [caseRow] = await db.select().from(casesTable).where(eq(casesTable.id, id));
  if (!caseRow) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  if (clueIndex < 0 || clueIndex >= caseRow.totalClues) {
    res.status(400).json({ error: `clueIndex must be 0–${caseRow.totalClues - 1}` });
    return;
  }

  const clueConfig = CLUE_CONFIGS[clueIndex];
  if (!clueConfig) {
    res.status(400).json({ error: "Invalid clue index" });
    return;
  }

  // Check cache
  const [existing] = await db
    .select()
    .from(cluesTable)
    .where(and(eq(cluesTable.caseId, id), eq(cluesTable.clueIndex, clueIndex)));

  if (existing?.data) {
    const totalCalls = await getTotalNansenCalls();
    res.json({
      clue: {
        clueIndex: existing.clueIndex,
        clueType: existing.clueType,
        title: existing.title,
        hint: existing.hint,
        nansenEndpoint: existing.nansenEndpoint,
        data: existing.data,
      },
      totalNansenCallsMade: totalCalls,
      fromCache: true,
      nansenConfigured: isNansenConfigured(),
    });
    return;
  }

  // Fetch from Nansen (or fall back to mock)
  let data: Record<string, unknown>;
  let fromCache = false;

  if (isNansenConfigured()) {
    try {
      const fetchers: Record<string, () => Promise<unknown>> = {
        balance: () => getWalletBalance(caseRow.walletAddress, caseRow.chain),
        pnl_summary: () => getWalletPnlSummary(caseRow.walletAddress, caseRow.chain),
        pnl: () => getWalletPnl(caseRow.walletAddress, caseRow.chain),
        transactions: () => getWalletTransactions(caseRow.walletAddress, caseRow.chain),
        dex_trades: () => getWalletDexTrades(caseRow.walletAddress, caseRow.chain),
        related_wallets: () => getWalletRelatedWallets(caseRow.walletAddress, caseRow.chain),
      };
      const fetcher = fetchers[clueConfig.clueType];
      data = (fetcher ? await fetcher() : {}) as Record<string, unknown>;
    } catch (err) {
      req.log.warn({ err }, "Nansen API call failed, falling back to mock data");
      data = getMockClueData(caseRow.walletType, clueConfig.clueType);
    }
  } else {
    data = getMockClueData(caseRow.walletType, clueConfig.clueType);
    fromCache = true;
  }

  // Cache in DB
  await db.insert(cluesTable).values({
    caseId: id,
    clueIndex,
    clueType: clueConfig.clueType,
    title: clueConfig.title,
    hint: clueConfig.hint,
    nansenEndpoint: clueConfig.nansenEndpoint,
    data,
  });

  const totalCalls = await getTotalNansenCalls();

  res.json({
    clue: {
      clueIndex,
      clueType: clueConfig.clueType,
      title: clueConfig.title,
      hint: clueConfig.hint,
      nansenEndpoint: clueConfig.nansenEndpoint,
      data,
    },
    totalNansenCallsMade: totalCalls,
    fromCache,
    nansenConfigured: isNansenConfigured(),
  });
});

// POST /cases/:id/verdict
router.post("/cases/:id/verdict", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid case id" });
    return;
  }

  const [caseRow] = await db.select().from(casesTable).where(eq(casesTable.id, id));
  if (!caseRow) {
    res.status(404).json({ error: "Case not found" });
    return;
  }

  const {
    walletType,
    confidence,
    sessionId,
    cluesUnlocked,
  } = req.body as {
    walletType: string;
    confidence: number;
    sessionId: string;
    cluesUnlocked: number;
  };

  const isCorrect = walletType === caseRow.walletType;
  const breakdown = calculateScore(isCorrect, confidence, cluesUnlocked, caseRow.totalClues);

  await db.insert(verdictTable).values({
    caseId: id,
    sessionId,
    walletTypeGuess: walletType,
    confidence,
    cluesUnlocked,
    score: breakdown.total,
    isCorrect,
  });

  // Increment case completed count
  await db
    .update(casesTable)
    .set({ completedCount: caseRow.completedCount + 1 })
    .where(eq(casesTable.id, id));

  res.json({
    score: breakdown.total,
    isCorrect,
    correctType: caseRow.walletType,
    correctTypeLabel: WALLET_TYPE_LABELS[caseRow.walletType] ?? caseRow.walletType,
    explanation: WALLET_TYPE_EXPLANATIONS[caseRow.walletType] ?? "",
    walletAddress: caseRow.walletAddress,
    walletAddressMasked: maskWalletAddress(caseRow.walletAddress),
    breakdown: {
      correctBonus: breakdown.correctBonus,
      speedBonus: breakdown.speedBonus,
      confidenceBonus: breakdown.confidenceBonus,
      confidencePenalty: breakdown.confidencePenalty,
      total: breakdown.total,
    },
  });
});

export default router;
