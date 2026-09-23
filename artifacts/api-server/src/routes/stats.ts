import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { apiCallLogTable, verdictTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { isNansenConfigured } from "../lib/nansen";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [totalRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(apiCallLogTable);

  const endpointRows = await db
    .select({
      endpoint: apiCallLogTable.endpoint,
      count: sql<number>`count(*)`,
    })
    .from(apiCallLogTable)
    .groupBy(apiCallLogTable.endpoint);

  const [completedRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(verdictTable);

  const correctRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(verdictTable)
    .where(eq(verdictTable.isCorrect, true));

  const totalCompleted = Number(completedRow?.count ?? 0);
  const totalCorrect = Number(correctRows[0]?.count ?? 0);
  const verdictAccuracy = totalCompleted > 0 ? totalCorrect / totalCompleted : null;

  const callsByEndpoint: Record<string, number> = {};
  for (const row of endpointRows) {
    callsByEndpoint[row.endpoint] = Number(row.count);
  }

  res.json({
    totalNansenCalls: Number(totalRow?.count ?? 0),
    callsByEndpoint,
    casesCompleted: totalCompleted,
    nansenConfigured: isNansenConfigured(),
    verdictAccuracy,
  });
});

export default router;
