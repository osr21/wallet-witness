import { useState } from "react";
import { useInvestigateWallet } from "@workspace/api-client-react";
import { Search, Database, Activity, AlertTriangle } from "lucide-react";
import { ClueRenderer } from "@/components/clues/ClueRenderer";
import { motion } from "framer-motion";

export default function Investigate() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("ethereum");
  
  const investigate = useInvestigateWallet();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;
    
    investigate.mutate({
      data: {
        walletAddress: address.trim(),
        chain
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 w-full">
      <div className="mb-12 border-l-2 border-primary pl-6 py-2">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">
          Live Investigation
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Enter any wallet address to query live Nansen API signals. Use this to build profiles of unknown actors in real-time.
        </p>
      </div>

      <div className="bg-card border border-border p-6 mb-12">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-mono text-muted-foreground uppercase mb-2">Target Address</label>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-background border border-border focus:border-primary text-foreground font-mono p-3 outline-none transition-colors"
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-xs font-mono text-muted-foreground uppercase mb-2">Network</label>
            <select 
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              className="w-full bg-background border border-border focus:border-primary text-foreground font-mono p-3 outline-none transition-colors appearance-none"
            >
              <option value="ethereum">Ethereum</option>
              <option value="base">Base</option>
              <option value="solana">Solana</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              type="submit"
              disabled={investigate.isPending || !address.trim()}
              className="w-full md:w-auto h-[50px] bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 px-8 font-mono text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            >
              {investigate.isPending ? (
                <><Activity className="w-4 h-4 animate-spin" /> Querying...</>
              ) : (
                <><Search className="w-4 h-4" /> Execute</>
              )}
            </button>
          </div>
        </form>

        {investigate.data && !investigate.data.nansenConfigured && (
          <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-4 text-sm font-mono flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <div>
              <strong className="block uppercase mb-1">Nansen API Not Configured</strong>
              Showing demo/mock data. To fetch real live data, configure the Nansen API key in the backend.
            </div>
          </div>
        )}
      </div>

      {investigate.isSuccess && investigate.data && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
            <h2 className="text-xl font-bold uppercase tracking-widest flex items-center gap-3">
              <Database className="w-5 h-5 text-primary" />
              Intelligence Report
            </h2>
            <div className="text-xs font-mono bg-background border border-border px-3 py-1 text-muted-foreground uppercase">
              Calls used: <span className="text-primary font-bold">{investigate.data.totalNansenCallsMade}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border p-5">
              <div className="text-[10px] font-mono text-primary mb-4 uppercase border-b border-border/50 pb-2">Component // Balance</div>
              <ClueRenderer clue={{ clueIndex: 0, clueType: 'balance', title: 'Wallet Balance', hint: '', data: investigate.data.balance }} />
            </div>
            
            <div className="bg-card border border-border p-5">
              <div className="text-[10px] font-mono text-primary mb-4 uppercase border-b border-border/50 pb-2">Component // PnL Summary</div>
              <ClueRenderer clue={{ clueIndex: 0, clueType: 'pnl_summary', title: 'Performance Summary', hint: '', data: investigate.data.pnlSummary }} />
            </div>

            <div className="bg-card border border-border p-5">
              <div className="text-[10px] font-mono text-primary mb-4 uppercase border-b border-border/50 pb-2">Component // DEX Activity</div>
              <ClueRenderer clue={{ clueIndex: 0, clueType: 'dex_trades', title: 'Recent Trades', hint: '', data: investigate.data.recentDexTrades }} />
            </div>

            <div className="bg-card border border-border p-5">
              <div className="text-[10px] font-mono text-primary mb-4 uppercase border-b border-border/50 pb-2">Component // Network Graph</div>
              <ClueRenderer clue={{ clueIndex: 0, clueType: 'related_wallets', title: 'Counterparties', hint: '', data: investigate.data.relatedWallets }} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
