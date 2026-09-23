import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { casesTable, verdictTable } from "@workspace/db";

const router: IRouter = Router();

// GET /leaderboard?caseId=1&sessionId=xxx
router.get("/leaderboard", async (req, res): Promise<void> => {
  const rawCaseId = req.query["caseId"];
  const sessionId = typeof req.query["sessionId"] === "string" ? req.query["sessionId"] : undefined;

  // Fetch active cases (optionally filtered)
  const casesQuery = db.select().from(casesTable).where(eq(casesTable.isActive, true));
  const allCases = await casesQuery;

  const filteredCases = rawCaseId
    ? allCases.filter((c) => c.id === parseInt(String(rawCaseId), 10))
    : allCases;

  // For each case, fetch top 20 verdicts by score + player's own entries
  const results = await Promise.all(
    filteredCases.map(async (c) => {
      // Top 20 by score desc
      const topEntries = await db
        .select()
        .from(verdictTable)
        .where(and(eq(verdictTable.caseId, c.id)))
        .orderBy(desc(verdictTable.score))
        .limit(20);

      // Player's best score for this case
      let playerBestScore: number | null = null;
      if (sessionId) {
        const playerEntries = topEntries.filter((e) => e.sessionId === sessionId);
        if (playerEntries.length > 0) {
          playerBestScore = Math.max(...playerEntries.map((e) => e.score ?? 0));
        } else {
          // Player may not be in top 20 — fetch their best separately
          const playerRows = await db
            .select()
            .from(verdictTable)
            .where(and(eq(verdictTable.caseId, c.id), eq(verdictTable.sessionId, sessionId)))
            .orderBy(desc(verdictTable.score))
            .limit(1);
          if (playerRows[0]?.score != null) {
            playerBestScore = playerRows[0].score;
          }
        }
      }

      const entries = topEntries.map((e, idx) => ({
        rank: idx + 1,
        score: e.score ?? 0,
        walletTypeGuess: e.walletTypeGuess,
        cluesUnlocked: e.cluesUnlocked,
        completedAt: e.completedAt.toISOString(),
        isCorrect: e.isCorrect ?? false,
        isPlayer: !!sessionId && e.sessionId === sessionId,
      }));

      return {
        caseId: c.id,
        caseTitle: c.title,
        difficulty: c.difficulty,
        entries,
        playerBestScore,
      };
    })
  );

  res.json({ cases: results });
});

export default router;
