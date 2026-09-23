import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { VerdictResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Share2, ArrowRight, ShieldCheck, ShieldAlert } from "lucide-react";

export default function CaseResult() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<VerdictResult | null>(null);

  useEffect(() => {
    // Retrieve result from history state
    const state = history.state;
    if (state && typeof state === 'object' && 'score' in state) {
      setResult(state as VerdictResult);
    } else {
      // If no result in state, redirect home
      setLocation('/');
    }
  }, [setLocation]);

  if (!result) return null;

  const handleShare = () => {
    const text = `Wallet Witness // Mission Complete\nVerdict: ${result.isCorrect ? 'CORRECT' : 'INCORRECT'}\nScore: ${result.score}\nActor: ${result.correctTypeLabel}\n\nCan you read the signals?`;
    navigator.clipboard.writeText(text);
    // Simple visual feedback could go here
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 w-full flex flex-col items-center">
      
      {/* Banner */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`w-full p-6 text-center border-b-4 mb-12 ${
          result.isCorrect ? 'bg-success/10 border-success text-success' : 'bg-destructive/10 border-destructive text-destructive'
        }`}
      >
        <div className="flex justify-center mb-4">
          {result.isCorrect ? (
            <ShieldCheck className="w-16 h-16" />
          ) : (
            <ShieldAlert className="w-16 h-16" />
          )}
        </div>
        <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-widest mb-2">
          {result.isCorrect ? 'Classification Confirmed' : 'Classification Failed'}
        </h1>
        <p className="font-mono text-lg uppercase tracking-wider opacity-80">
          Target Identity: {result.correctTypeLabel}
        </p>
      </motion.div>

      {/* Score Section */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1)_0%,rgba(0,0,0,0)_70%)]" />
          <h3 className="font-mono text-sm text-muted-foreground uppercase tracking-widest mb-2 relative z-10">
            Final Intel Score
          </h3>
          <div className="text-7xl font-bold font-mono text-primary mb-6 relative z-10">
            {result.score}
          </div>
          
          <div className="w-full space-y-2 text-xs font-mono relative z-10">
            {Object.entries(result.breakdown).map(([key, val]: [string, any]) => (
              <div key={key} className="flex justify-between items-center border-b border-border/50 pb-1">
                <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <span className={val > 0 ? 'text-success' : val < 0 ? 'text-destructive' : 'text-foreground'}>
                  {val > 0 ? '+' : ''}{val}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border p-8 flex flex-col"
        >
          <h3 className="font-mono text-sm text-muted-foreground uppercase tracking-widest mb-4 border-b border-border pb-2">
            Target Analysis Report
          </h3>
          <div className="font-mono text-xs text-primary mb-4 bg-background p-3 border border-border break-all">
            DECRYPTED: {result.walletAddress}
          </div>
          <p className="text-foreground leading-relaxed flex-1">
            {result.explanation}
          </p>
        </motion.div>
      </div>

      {/* Actions */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4 w-full md:w-auto"
      >
        <button
          onClick={handleShare}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-card border border-border hover:border-primary text-foreground hover:text-primary transition-colors px-6 py-4 font-mono text-sm uppercase font-bold tracking-wider"
        >
          <Share2 className="w-4 h-4" /> Export Report
        </button>
        <button
          onClick={() => setLocation('/')}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-8 py-4 font-mono text-sm uppercase font-bold tracking-wider"
        >
          Next Mission <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

    </div>
  );
}
