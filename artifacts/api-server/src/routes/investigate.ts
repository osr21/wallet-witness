import { Router, type IRouter } from "express";
import {
  isNansenConfigured,
  getWalletBalance,
  getWalletPnlSummary,
  getWalletDexTrades,
  getWalletRelatedWallets,
  getTotalNansenCalls,
} from "../lib/nansen";
import { getMockClueData } from "../lib/mock-data";

/** Balance-shaped fallback for when the holdings endpoint is unavailable */
const BALANCE_FALLBACK = getMockClueData("retail", "balance");

const router: IRouter = Router();

router.post("/investigate", async (req, res): Promise<void> => {
  const { walletAddress, chain } = req.body as {
    walletAddress: string;
    chain: string;
  };

  if (!walletAddress || !chain) {
    res.status(400).json({ error: "walletAddress and chain are required" });
    return;
  }

  if (isNansenConfigured()) {
    try {
      const [balance, pnlSummary, recentDexTrades, relatedWallets] =
        await Promise.all([
          getWalletBalance(walletAddress, chain).catch(() => BALANCE_FALLBACK),
          getWalletPnlSummary(walletAddress, chain).catch(() => ({})),
          getWalletDexTrades(walletAddress, chain).catch(() => ({})),
          getWalletRelatedWallets(walletAddress, chain).catch(() => ({})),
        ]);

      const totalCalls = await getTotalNansenCalls();

      res.json({
        walletAddress,
        chain,
        balance,
        pnlSummary,
        recentDexTrades,
        relatedWallets,
        totalNansenCallsMade: totalCalls,
        nansenConfigured: true,
      });
      return;
    } catch (err) {
      req.log.warn({ err }, "Live investigation failed");
    }
  }

  // No API key — return mock data
  res.json({
    walletAddress,
    chain,
    balance: getMockClueData("retail", "balance"),
    pnlSummary: getMockClueData("retail", "pnl_summary"),
    recentDexTrades: getMockClueData("retail", "dex_trades"),
    relatedWallets: getMockClueData("retail", "related_wallets"),
    totalNansenCallsMade: 0,
    nansenConfigured: false,
  });
});

export default router;
