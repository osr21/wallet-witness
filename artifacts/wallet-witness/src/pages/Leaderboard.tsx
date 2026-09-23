import { useState } from "react";
import { useGetLeaderboard, useListCases } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Trophy, Medal, CheckCircle2, XCircle } from "lucide-react";
import { getPlayerId } from "@/lib/player-id";

const WALLET_TYPE_LABELS: Record<string, string> = {
  smart_money: "Smart Money",
  whale: "Whale",
  retail: "Retail",
  insider: "Insider",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-green-400 border-green-400/30 bg-green-400/10",
  medium: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
  hard: "text-red-400 border-red-400/30 bg-red-400/10",
};

function getRankIcon(rank: number) {
  if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-400" />;
  if (rank === 2) return <Medal className="w-4 h-4 text-slate-300" />;
  if (rank === 3) return <Medal className="w-4 h-4 text-amber-700" />;
  return null;
}

export default function Leaderboard() {
  const [selectedCaseId, setSelectedCaseId] = useState<number | undefined>(undefined);
  // Use stable player ID so we can highlight this player's entries
  const sessionId = getPlayerId();

  const { data: cases, isLoading: casesLoading } = useListCases();
  const { data: leaderboard, isLoading: boardLoading } = useGetLeaderboard(
    {
      ...(selectedCaseId !== undefined ? { caseId: selectedCaseId } : {}),
      ...(sessionId ? { sessionId } : {}),
    },
  );

  const isLoading = casesLoading || boardLoading;
  const caseData = leaderboard?.cases ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 w-full">
      {/* Header */}
      <div className="mb-10 mt-6 border-l-2 border-primary pl-6 py-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-tight">
            Global <span className="text-primary">Rankings</span>
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground text-sm font-mono"
        >
          Top 20 agents ranked by intel score per case file.{" "}
          {sessionId && (
            <span className="text-primary">Your entries are highlighted.</span>
          )}
        </motion.p>
      </div>

      {/* Case filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8 flex flex-wrap gap-2"
      >
        <button
          onClick={() => setSelectedCaseId(undefined)}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-widest border transition-colors rounded-sm ${
            selectedCaseId === undefined
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          All Cases
        </button>
        {cases?.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCaseId(c.id)}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-widest border transition-colors rounded-sm ${
              selectedCaseId === c.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            Case {String(c.id).padStart(3, "0")}
          </button>
        ))}
      </motion.div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-card/50 border border-border rounded-sm animate-pulse" />
          ))}
        </div>
      )}

      {/* Leaderboard tables */}
      {!isLoading && (
        <div className="space-y-10">
          {caseData.length === 0 && (
            <div className="text-center py-24 text-muted-foreground font-mono text-sm">
              NO_DATA // No verdicts recorded yet. Complete a case to appear here.
            </div>
          )}

          {caseData.map((caseEntry, caseIdx) => (
            <motion.div
              key={caseEntry.caseId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * caseIdx }}
              className="bg-card border border-border rounded-sm overflow-hidden"
            >
              {/* Case header */}
              <div className="px-6 py-4 border-b border-border bg-black/20 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 border border-border rounded-sm uppercase">
                    CASE {String(caseEntry.caseId).padStart(3, "0")}
                  </span>
                  <h2 className="text-base font-bold text-foreground uppercase tracking-wide">
                    {caseEntry.caseTitle}
                  </h2>
                  <span
                    className={`text-[10px] font-mono px-2 py-1 uppercase rounded-sm border ${
                      DIFFICULTY_COLORS[caseEntry.difficulty] ?? ""
                    }`}
                  >
                    {caseEntry.difficulty}
                  </span>
                </div>
                {caseEntry.playerBestScore != null && (
                  <div className="text-xs font-mono text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-sm">
                    YOUR BEST: {caseEntry.playerBestScore} pts
                  </div>
                )}
              </div>

              {/* Table */}
              {caseEntry.entries.length === 0 ? (
                <div className="px-6 py-10 text-center text-muted-foreground font-mono text-xs">
                  NO_ENTRIES // Be the first to close this case.
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest w-16">Rank</th>
                      <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest">Score</th>
                      <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest">Verdict</th>
                      <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest">Clues Used</th>
                      <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest hidden md:table-cell">Completed</th>
                      <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-widest w-16 hidden sm:table-cell">Correct</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseEntry.entries.map((entry) => (
                      <tr
                        key={`${entry.rank}-${entry.completedAt}`}
                        className={`border-b border-border/50 transition-colors ${
                          entry.isPlayer
                            ? "bg-primary/10 border-l-2 border-l-primary"
                            : "hover:bg-white/[0.02]"
                        }`}
                      >
                        {/* Rank */}
                        <td className="px-4 py-3 font-mono">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${entry.rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>
                              #{entry.rank}
                            </span>
                            {getRankIcon(entry.rank)}
                            {entry.isPlayer && (
                              <span className="text-[9px] font-mono text-primary uppercase bg-primary/20 px-1 rounded">YOU</span>
                            )}
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-4 py-3 font-mono">
                          <span className={`text-lg font-bold ${entry.isPlayer ? "text-primary" : "text-foreground"}`}>
                            {entry.score}
                          </span>
                        </td>

                        {/* Wallet type guessed */}
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {WALLET_TYPE_LABELS[entry.walletTypeGuess] ?? entry.walletTypeGuess}
                        </td>

                        {/* Clues used */}
                        <td className="px-4 py-3 font-mono text-xs">
                          {entry.cluesUnlocked} clue{entry.cluesUnlocked !== 1 ? "s" : ""}
                        </td>

                        {/* Completed at */}
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden md:table-cell">
                          {new Date(entry.completedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* Correct */}
                        <td className="px-4 py-3 hidden sm:table-cell">
                          {entry.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400/60" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
