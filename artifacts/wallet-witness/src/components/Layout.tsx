import { Link, useLocation } from "wouter";
import { Search, ShieldAlert, TerminalSquare, Trophy } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground scanlines font-sans flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded border border-primary/30 bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <ShieldAlert className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold text-sm tracking-widest text-primary uppercase leading-tight">
                Wallet Witness
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-tight">
                Nansen Intelligence
              </span>
            </div>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm font-mono tracking-widest uppercase transition-colors hover:text-primary ${location === '/' ? 'text-primary border-b-2 border-primary py-5' : 'text-muted-foreground'}`}
            >
              Cases
            </Link>
            <Link 
              href="/leaderboard" 
              className={`flex items-center gap-2 text-sm font-mono tracking-widest uppercase transition-colors hover:text-primary ${location === '/leaderboard' ? 'text-primary border-b-2 border-primary py-5' : 'text-muted-foreground'}`}
            >
              <Trophy className="w-4 h-4" />
              Rankings
            </Link>
            <Link 
              href="/investigate" 
              className={`flex items-center gap-2 text-sm font-mono tracking-widest uppercase transition-colors hover:text-primary ${location === '/investigate' ? 'text-primary border-b-2 border-primary py-5' : 'text-muted-foreground'}`}
            >
              <Search className="w-4 h-4" />
              Investigate
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.03)_0%,rgba(0,0,0,0)_70%)]" />
        {children}
      </main>

      <footer className="border-t border-border bg-card/50 py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-2">
            <TerminalSquare className="w-4 h-4" />
            <span>SYS_READY // V.0.1.0</span>
          </div>
          <div>
            POWERED BY NANSEN.AI
          </div>
        </div>
      </footer>
    </div>
  );
}
