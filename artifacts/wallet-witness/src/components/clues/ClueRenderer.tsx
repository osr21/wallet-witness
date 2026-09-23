import { ClueData } from "@workspace/api-client-react/src/generated/api.schemas";
import { ArrowDownRight, ArrowUpRight, DollarSign, Activity } from "lucide-react";

export function ClueRenderer({ clue }: { clue: ClueData }) {
  const { data, clueType } = clue;

  const formatUsd = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const formatNum = (val: any) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('en-US').format(num);
  };

  switch (clueType) {
    case 'balance': {
      const { total_value_usd, top_tokens } = data as any;
      return (
        <div>
          <div className="mb-4">
            <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Total Net Worth</div>
            <div className="text-3xl font-mono text-primary font-bold">{formatUsd(total_value_usd)}</div>
          </div>
          {top_tokens && Array.isArray(top_tokens) && (
            <div className="bg-background border border-border/50 rounded-sm">
              <table className="w-full text-sm font-mono">
                <thead className="bg-card border-b border-border/50">
                  <tr>
                    <th className="text-left p-2 font-normal text-muted-foreground">Asset</th>
                    <th className="text-right p-2 font-normal text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {top_tokens.map((t: any, i: number) => (
                    <tr key={i} className="border-b border-border/10 last:border-0">
                      <td className="p-2 text-foreground font-bold">{t.symbol}</td>
                      <td className="p-2 text-right text-muted-foreground">{formatUsd(t.value_usd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    case 'pnl_summary': {
      const { realized_pnl_usd, winrate, total_trades, avg_hold_days } = data as any;
      const isPositive = Number(realized_pnl_usd) >= 0;
      
      return (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 bg-background p-4 border border-border/50 flex flex-col items-center justify-center">
            <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Realized PnL</div>
            <div className={`text-3xl font-mono font-bold flex items-center ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? <ArrowUpRight className="w-6 h-6 mr-1" /> : <ArrowDownRight className="w-6 h-6 mr-1" />}
              {formatUsd(Math.abs(Number(realized_pnl_usd)))}
            </div>
          </div>
          
          <div className="bg-background p-3 border border-border/50">
            <div className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Winrate</div>
            <div className="text-lg font-mono text-foreground">{Number(winrate).toFixed(1)}%</div>
            <div className="h-1 bg-card mt-2 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Number(winrate)}%` }} />
            </div>
          </div>
          
          <div className="bg-background p-3 border border-border/50">
            <div className="text-[10px] text-muted-foreground font-mono uppercase mb-1">Activity</div>
            <div className="text-sm font-mono text-foreground mb-1">{formatNum(total_trades)} Trades</div>
            <div className="text-xs font-mono text-muted-foreground">Avg Hold: {avg_hold_days}d</div>
          </div>
        </div>
      );
    }

    case 'pnl': {
      const trades = Array.isArray(data.tokens) ? data.tokens : [];
      return (
        <div className="bg-background border border-border/50 max-h-[250px] overflow-y-auto">
          <table className="w-full text-xs font-mono">
            <thead className="bg-card border-b border-border/50 sticky top-0">
              <tr>
                <th className="text-left p-2 font-normal text-muted-foreground">Token</th>
                <th className="text-right p-2 font-normal text-muted-foreground">PnL</th>
                <th className="text-right p-2 font-normal text-muted-foreground">ROI</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t: any, i: number) => {
                const isPositive = Number(t.realized_pnl) >= 0;
                return (
                  <tr key={i} className="border-b border-border/10 last:border-0 hover:bg-card/50">
                    <td className="p-2 font-bold text-foreground">{t.symbol}</td>
                    <td className={`p-2 text-right ${isPositive ? 'text-success' : 'text-destructive'}`}>
                      {isPositive ? '+' : '-'}{formatUsd(Math.abs(Number(t.realized_pnl)))}
                    </td>
                    <td className="p-2 text-right text-muted-foreground">
                      {Number(t.roi).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {trades.length === 0 && (
            <div className="p-4 text-center text-muted-foreground font-mono text-xs">No significant trade data.</div>
          )}
        </div>
      );
    }

    case 'transactions': {
      const { total_count, recent } = data as any;
      return (
        <div className="flex flex-col h-full">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground uppercase">Lifetime TXs</span>
            <span className="font-mono font-bold text-primary">{formatNum(total_count)}</span>
          </div>
          
          <div className="bg-background border border-border/50 flex-1 p-2 space-y-2 overflow-y-auto max-h-[200px]">
            {recent && Array.isArray(recent) && recent.map((tx: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-2 border border-border/20 bg-card/30 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary" />
                  <span className="truncate w-24 text-muted-foreground">{tx.hash?.substring(0, 8)}...</span>
                </div>
                <div>{new Date(tx.timestamp).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'dex_trades': {
      const trades = Array.isArray(data.trades) ? data.trades : [];
      return (
        <div className="bg-background border border-border/50 max-h-[250px] overflow-y-auto">
          <table className="w-full text-xs font-mono">
            <thead className="bg-card border-b border-border/50 sticky top-0">
              <tr>
                <th className="text-left p-2 font-normal text-muted-foreground">Action</th>
                <th className="text-left p-2 font-normal text-muted-foreground">Pair</th>
                <th className="text-right p-2 font-normal text-muted-foreground">Value</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((t: any, i: number) => (
                <tr key={i} className="border-b border-border/10 last:border-0">
                  <td className={`p-2 font-bold ${t.action === 'buy' ? 'text-success' : 'text-destructive'}`}>
                    {t.action.toUpperCase()}
                  </td>
                  <td className="p-2 text-muted-foreground">{t.pair}</td>
                  <td className="p-2 text-right text-foreground">{formatUsd(t.usd_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'related_wallets': {
      const wallets = Array.isArray(data.wallets) ? data.wallets : [];
      return (
        <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto">
          {wallets.map((w: any, i: number) => (
            <div key={i} className="bg-background border border-border/50 p-3 flex justify-between items-center">
              <div>
                <div className="font-mono text-xs text-foreground bg-card px-1 py-0.5 rounded-sm inline-block mb-1 border border-border/30">
                  {w.address.substring(0, 6)}...{w.address.substring(w.address.length - 4)}
                </div>
                <div className="text-[10px] text-primary uppercase font-bold tracking-wider">{w.label || 'Unknown Entity'}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-muted-foreground">Volume</div>
                <div className="text-sm font-mono text-foreground">{formatUsd(w.volume_usd)}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    default:
      return (
        <div className="font-mono text-xs text-muted-foreground bg-background p-4 border border-border/50 overflow-x-auto">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
  }
}
