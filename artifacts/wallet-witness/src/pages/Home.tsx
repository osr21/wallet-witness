import { useListCases, useGetStats } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Activity, AlertTriangle, ChevronRight, Fingerprint, Database, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: cases, isLoading: casesLoading } = useListCases();
  const { data: stats } = useGetStats();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 w-full">
      {/* Hero Section */}
      <div className="mb-16 mt-8 border-l-2 border-primary pl-6 py-2">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4"
        >
          Classified Intel
          <br/>
          <span className="text-primary">Awaiting Analysis</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground max-w-2xl text-lg"
        >
          We have intercepted anonymous wallet signals. Your mission is to analyze their on-chain behavior and classify the actor. Every clue you unlock costs one Nansen API credit. Proceed with precision.
        </motion.p>
      </div>

      {/* Stats Bar */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          <div className="bg-card border border-border p-4 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="text-muted-foreground text-xs font-mono mb-1 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-3 h-3" /> Nansen Calls
            </div>
            <div className="text-3xl font-mono text-foreground">{stats.totalNansenCalls}</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <div className="text-muted-foreground text-xs font-mono mb-1 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3 h-3" /> Cases Closed
            </div>
            <div className="text-3xl font-mono text-foreground">{stats.casesCompleted}</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
            <div className="text-muted-foreground text-xs font-mono mb-1 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-3 h-3" /> API Configured
            </div>
            <div className="text-3xl font-mono text-foreground">{stats.nansenConfigured ? 'ONLINE' : 'DEMO'}</div>
          </div>
          <div className="bg-card border border-border p-4 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
            <div className="text-muted-foreground text-xs font-mono mb-1 uppercase tracking-wider flex items-center gap-2">
              <Fingerprint className="w-3 h-3" /> Accuracy
            </div>
            <div className="text-3xl font-mono text-foreground">{stats.verdictAccuracy ? `${stats.verdictAccuracy}%` : 'N/A'}</div>
          </div>
        </motion.div>
      )}

      {/* Cases Grid */}
      <div>
        <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
          <h2 className="text-xl font-bold uppercase tracking-widest text-foreground flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Active Case Files
          </h2>
          <span className="text-xs font-mono text-muted-foreground">
            {cases?.length || 0} FILES DETECTED
          </span>
        </div>

        {casesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-card/50 border border-border rounded-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases?.map((c, index) => (
              <motion.div 
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-card border border-border rounded-sm hover:border-primary/50 transition-colors flex flex-col group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Fingerprint className="w-24 h-24 text-primary" />
                </div>
                
                <div className="p-6 flex-1 relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono bg-secondary px-2 py-1 text-muted-foreground border border-border rounded-sm uppercase">
                      CASE {String(c.id).padStart(3, '0')}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-1 uppercase rounded-sm border ${
                      c.difficulty === 'easy' ? 'text-green-400 border-green-400/30 bg-green-400/10' :
                      c.difficulty === 'medium' ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' :
                      'text-red-400 border-red-400/30 bg-red-400/10'
                    }`}>
                      LVL: {c.difficulty}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {c.title}
                  </h3>
                  
                  <div className="font-mono text-xs text-primary/70 mb-4 bg-black/40 px-2 py-1 rounded-sm break-all">
                    {c.walletAddressMasked}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-3">
                    {c.description}
                  </p>
                </div>
                
                <div className="px-6 py-4 border-t border-border bg-black/20 flex items-center justify-between mt-auto">
                  <div className="text-xs font-mono text-muted-foreground">
                    CHAIN: {c.chain.toUpperCase()}
                  </div>
                  <Link 
                    href={`/cases/${c.id}`}
                    className="flex items-center gap-2 text-xs font-mono font-bold text-primary hover:text-white transition-colors"
                  >
                    BEGIN INVESTIGATION <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
