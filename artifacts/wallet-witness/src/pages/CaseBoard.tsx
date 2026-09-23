import { useState, useRef, useEffect, useMemo } from 'react';
import { getPlayerId } from '@/lib/player-id';
import { useGetCase, useUnlockClue, useSubmitVerdict, getGetCaseQueryKey, VerdictInputWalletType } from '@workspace/api-client-react';
import { useLocation, useParams } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Fingerprint, Lock, Unlock, Database, Activity, DollarSign, Crosshair, ChevronRight } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { ClueData } from '@workspace/api-client-react/src/generated/api.schemas';
import { ClueRenderer } from '@/components/clues/ClueRenderer';

export default function CaseBoard() {
  const params = useParams();
  const id = Number(params.id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [sessionId] = useState(() => getPlayerId());
  const [confidence, setConfidence] = useState(50);
  
  const { data: caseData, isLoading } = useGetCase(id);
  const unlockClue = useUnlockClue();
  const submitVerdict = useSubmitVerdict();

  const unlockedCount = caseData?.unlockedClues.length || 0;
  const nextClueIndex = unlockedCount;
  const canUnlock = caseData && unlockedCount < caseData.totalClues;

  const handleUnlock = () => {
    if (!canUnlock) return;
    
    unlockClue.mutate({
      id,
      data: { clueIndex: nextClueIndex, sessionId }
    }, {
      onSuccess: (result) => {
        // Update local cache safely to avoid full refetch
        queryClient.setQueryData(getGetCaseQueryKey(id), (old: any) => {
          if (!old) return old;
          return {
            ...old,
            unlockedClues: [...old.unlockedClues, result.clue]
          };
        });
      }
    });
  };

  const handleVerdict = (walletType: VerdictInputWalletType) => {
    submitVerdict.mutate({
      id,
      data: {
        walletType,
        confidence,
        sessionId,
        cluesUnlocked: unlockedCount
      }
    }, {
      onSuccess: (result) => {
        // Use wouter history state to pass data
        history.pushState(result, '', `/cases/${id}/result`);
        setLocation(`/cases/${id}/result`);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-primary">
          <Activity className="w-8 h-8 animate-spin" />
          <span className="font-mono text-sm tracking-widest uppercase animate-pulse">Decrypting File...</span>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return <div className="p-12 text-center text-destructive">Case not found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 w-full">
      {/* Header / Briefing */}
      <div className="mb-10 flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 bg-card border border-border p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Shield className="w-32 h-32" />
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary/20 text-primary font-mono text-xs px-2 py-1 uppercase border border-primary/30">
              Target Profile
            </span>
            <span className="text-muted-foreground font-mono text-xs uppercase">
              Chain: {caseData.chain}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold uppercase tracking-wide mb-2 text-foreground">
            {caseData.title}
          </h1>
          
          <div className="font-mono text-xl text-primary bg-black/40 p-3 border border-border/50 rounded-sm mb-6 inline-block">
            {caseData.walletAddressMasked}
          </div>
          
          <div className="prose prose-invert prose-p:text-muted-foreground max-w-none">
            <p>{caseData.narrative}</p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-card border border-border p-5">
            <h3 className="font-mono text-sm uppercase text-muted-foreground mb-4 flex items-center gap-2">
              <Database className="w-4 h-4" /> Intel Control
            </h3>
            
            <div className="mb-4">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-foreground">Clues Unlocked</span>
                <span className="text-primary">{unlockedCount} / {caseData.totalClues}</span>
              </div>
              <div className="h-2 bg-background border border-border rounded-sm overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${(unlockedCount / caseData.totalClues) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleUnlock}
              disabled={!canUnlock || unlockClue.isPending}
              className="w-full relative overflow-hidden bg-background border border-primary text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-3 font-mono text-sm uppercase font-bold flex items-center justify-center gap-2 group"
            >
              {unlockClue.isPending ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : canUnlock ? (
                <>
                  <Unlock className="w-4 h-4" /> Request Data Pull
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Max Clues Reached
                </>
              )}
              {canUnlock && !unlockClue.isPending && (
                <span className="absolute right-0 top-0 bottom-0 flex items-center pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  (-1 CR)
                </span>
              )}
            </button>
            {canUnlock && (
              <p className="text-[10px] text-muted-foreground text-center mt-3 font-mono uppercase">
                Costs 1 Nansen API Credit
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Clues Board */}
      <h3 className="text-xl font-bold uppercase tracking-widest text-foreground flex items-center gap-3 mb-6 border-b border-border pb-4">
        <Fingerprint className="w-5 h-5 text-primary" />
        Evidence Board
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <AnimatePresence mode="popLayout">
          {Array.from({ length: caseData.totalClues }).map((_, i) => {
            const clue = caseData.unlockedClues.find(c => c.clueIndex === i);
            const isNext = i === nextClueIndex;
            
            return (
              <motion.div
                key={`clue-${i}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative bg-card border rounded-sm p-5 min-h-[200px] flex flex-col ${
                  clue ? 'border-primary/30' : 
                  isNext ? 'border-border border-dashed' : 'border-border/50 bg-card/50'
                }`}
              >
                {clue ? (
                  <>
                    <div className="flex justify-between items-start mb-4 border-b border-border/50 pb-3">
                      <div>
                        <div className="text-[10px] font-mono text-primary mb-1 uppercase">Clue {i + 1} // {clue.clueType}</div>
                        <h4 className="text-lg font-bold text-foreground">{clue.title}</h4>
                      </div>
                      {clue.nansenEndpoint && (
                        <div className="text-[9px] font-mono text-muted-foreground bg-background px-2 py-1 rounded-sm border border-border">
                          GET {clue.nansenEndpoint}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <ClueRenderer clue={clue} />
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground italic">
                      Analysis: {clue.hint}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                    <Lock className="w-8 h-8 mb-3 text-muted-foreground" />
                    <div className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
                      File {i + 1} Encrypted
                    </div>
                    {isNext && (
                      <div className="text-[10px] text-primary mt-2 uppercase font-mono">
                        Awaiting Request...
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Submit Verdict */}
      <div className="bg-card border-2 border-border p-8 relative">
        <div className="absolute -top-3 left-6 bg-background px-2 text-xs font-mono text-primary font-bold uppercase tracking-widest">
          Submit Final Verdict
        </div>
        
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <label className="block text-sm font-mono text-muted-foreground uppercase mb-4 flex justify-between">
              <span>Confidence Level</span>
              <span className="text-primary font-bold">{confidence}%</span>
            </label>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-primary h-2 bg-background rounded-sm appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground mt-2 uppercase">
              <span>Low (Less Penalty/Bonus)</span>
              <span>High (High Penalty/Bonus)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.entries(VerdictInputWalletType) as [string, VerdictInputWalletType][]).map(([key, value]) => (
              <button
                key={value}
                onClick={() => handleVerdict(value)}
                disabled={submitVerdict.isPending}
                className="flex flex-col items-center justify-center p-4 border border-border bg-background hover:border-primary hover:bg-primary/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Crosshair className="w-6 h-6 mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-mono text-sm font-bold uppercase tracking-wider group-hover:text-primary transition-colors">
                  {key.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
          
          {submitVerdict.isPending && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 border border-primary">
              <div className="text-primary font-mono font-bold uppercase tracking-widest flex items-center gap-3">
                <Activity className="w-5 h-5 animate-spin" /> Transmitting...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
