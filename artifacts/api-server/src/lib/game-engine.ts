export const WALLET_TYPE_LABELS: Record<string, string> = {
  smart_money: "Smart Money",
  whale: "Whale",
  retail: "Retail Trader",
  insider: "Insider-Like",
};

export const WALLET_TYPE_EXPLANATIONS: Record<string, string> = {
  smart_money:
    "This is a Smart Money wallet — part of Nansen's curated list of the top 5,000 highest-performing wallets ranked by realized profit, win rate, and strong performance across market cycles. They enter early, size precisely, and exit cleanly.",
  whale:
    "This is a Whale — a wallet holding enormous value but rarely active. They accumulated during bear markets and now sit on unrealized gains that would move prices if they sold. These wallets often transact directly with institutions, not DEXes.",
  retail:
    "This is a Retail Trader — active, enthusiastic, and consistently late to the trend. High transaction count, low win rate, small position sizes relative to gas costs. The backbone of exit liquidity.",
  insider:
    "This is an Insider-Like wallet — a pattern Nansen flags when a wallet consistently buys tokens hours or days before major announcements. Whether it's information asymmetry or extraordinary intuition, the results are difficult to explain any other way.",
};

export interface ScoreBreakdown {
  correctBonus: number;
  speedBonus: number;
  confidenceBonus: number;
  confidencePenalty: number;
  total: number;
}

export function calculateScore(
  isCorrect: boolean,
  confidence: number,
  cluesUnlocked: number,
  totalClues: number,
): ScoreBreakdown {
  const correctBonus = isCorrect ? 60 : 0;

  // Speed bonus: max 30 points for solving on first clue, scales down
  const speedBonus = isCorrect
    ? Math.max(0, Math.round(30 * (1 - (cluesUnlocked - 1) / (totalClues - 1))))
    : 0;

  // Confidence bonus: if correct and confident, earn up to 10 extra points
  const confidenceBonus =
    isCorrect && confidence > 60
      ? Math.round(((confidence - 60) / 40) * 10)
      : 0;

  // Confidence penalty: overconfident wrong answers lose points
  const confidencePenalty =
    !isCorrect && confidence > 70 ? -Math.round(((confidence - 70) / 30) * 20) : 0;

  const total = Math.max(
    0,
    correctBonus + speedBonus + confidenceBonus + confidencePenalty,
  );

  return { correctBonus, speedBonus, confidenceBonus, confidencePenalty, total };
}

export function maskWalletAddress(address: string): string {
  if (address.startsWith("0x") && address.length >= 10) {
    return `${address.slice(0, 8)}...${address.slice(-4)}`;
  }
  if (address.length >= 10) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return address;
}
