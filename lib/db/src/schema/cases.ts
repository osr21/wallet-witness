import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const casesTable = pgTable("cases", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  walletAddress: text("wallet_address").notNull(),
  chain: text("chain").notNull().default("ethereum"),
  walletType: text("wallet_type").notNull(), // smart_money | whale | retail | insider
  difficulty: text("difficulty").notNull().default("medium"),
  narrative: text("narrative").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  totalClues: integer("total_clues").notNull().default(6),
  completedCount: integer("completed_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cluesTable = pgTable("clues", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => casesTable.id).notNull(),
  clueIndex: integer("clue_index").notNull(),
  clueType: text("clue_type").notNull(), // balance | pnl_summary | pnl | transactions | dex_trades | related_wallets
  title: text("title").notNull(),
  hint: text("hint").notNull(),
  nansenEndpoint: text("nansen_endpoint"),
  data: jsonb("data"),
  cachedAt: timestamp("cached_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verdictTable = pgTable("verdicts", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").references(() => casesTable.id).notNull(),
  sessionId: text("session_id").notNull(),
  walletTypeGuess: text("wallet_type_guess").notNull(),
  confidence: integer("confidence").notNull().default(50),
  cluesUnlocked: integer("clues_unlocked").notNull().default(0),
  score: integer("score"),
  isCorrect: boolean("is_correct"),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const apiCallLogTable = pgTable("api_call_log", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").notNull(),
  walletAddress: text("wallet_address"),
  chain: text("chain"),
  creditsUsed: integer("credits_used").notNull().default(1),
  success: boolean("success").notNull().default(true),
  calledAt: timestamp("called_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCaseSchema = createInsertSchema(casesTable).omit({ id: true, createdAt: true, completedCount: true });
export const insertClueSchema = createInsertSchema(cluesTable).omit({ id: true, cachedAt: true });
export const insertVerdictSchema = createInsertSchema(verdictTable).omit({ id: true, completedAt: true });
export const insertApiCallLogSchema = createInsertSchema(apiCallLogTable).omit({ id: true, calledAt: true });

export type Case = typeof casesTable.$inferSelect;
export type Clue = typeof cluesTable.$inferSelect;
export type Verdict = typeof verdictTable.$inferSelect;
export type ApiCallLog = typeof apiCallLogTable.$inferSelect;

export type InsertCase = z.infer<typeof insertCaseSchema>;
export type InsertClue = z.infer<typeof insertClueSchema>;
export type InsertVerdict = z.infer<typeof insertVerdictSchema>;
