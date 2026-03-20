import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useOnboard } from '../../context/OnboardContext';
import { Navbar } from '../../components/Navbar';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const signals = [
  { text: "Parsing response latency", detail: "Calculating keystroke delta vs median" },
  { text: "Scoring error frequency", detail: "Applying AST analysis to code resolution" },
  { text: "Mapping cognitive load signals", detail: "Extracting friction vectors" },
  { text: "Traversing prerequisite knowledge graph", detail: "Walking DAG architecture" },
  { text: "Grounding recommendations against course catalog", detail: "Querying ChromaDB for semantic matches" },
  { text: "Constructing your retroactive pathway.", detail: "Finalizing personalized linear roadmap" }
];

export default function Analysing() {
  const navigate = useNavigate();
  const { pathway } = useOnboard();
  const [completedSignals, setCompletedSignals] = useState(-1);

  useEffect(() => {
    // Reveal signals staggered
    let idx = 0;
    const interval = setInterval(() => {
      setCompletedSignals(idx);
      idx++;
      if (idx >= signals.length) {
        clearInterval(interval);
        setTimeout(() => navigate(ROUTES.ROADMAP), 2000);
      }
    }, 2500); // 2.5s * 6 = 15 seconds

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center relative overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full relative z-10 z-[1] max-w-2xl mx-auto">
        <h1 className="font-headline text-[42px] text-primary-dark mb-2 text-center sm:text-left w-full">Analysing your work patterns.</h1>
        <p className="font-body text-sm text-muted mb-8 w-full">This takes about 15 seconds.</p>
      
      {/* Waveform BG mock */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-30">
        <motion.div 
          animate={{ scaleX: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[800px] h-[300px] bg-[#f1f5f9] rounded-full blur-[80px]"
        />
      </div>

      {/* Removed old floating title */}
        
        {/* Fill bar */}
        <div className="w-full h-[2px] bg-border mb-12 relative overflow-hidden rounded-full">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 15, ease: 'linear' }}
            className="absolute top-0 left-0 h-full bg-primary-dark"
          />
        </div>

        {/* Signals */}
        <div className="space-y-6">
          {signals.map((sig, i) => {
            const isCompleted = completedSignals >= i;
            const isCurrent = completedSignals === i - 1; // Actually we reveal one by one, wait, logic:
            // if completedSignals is -1, none are current but maybe 0 is revealed.
            // Let's just say a signal appears staggered.
            
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ 
                  opacity: i <= completedSignals + 1 ? 1 : 0, 
                  x: i <= completedSignals + 1 ? 0 : -10 
                }}
                transition={{ duration: 0.4 }}
                className="flex items-start gap-4"
              >
                <div className="mt-1">
                  {isCompleted ? (
                    <div className="w-4 h-4 rounded-full bg-green flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 rounded-full border-2 border-[#e2e8f0] border-t-primary-dark"
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-body text-[15px] text-primary-dark mb-0.5">{sig.text}</h4>
                  <p className="font-mono text-[11px] text-[#64748b]">{sig.detail}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </main>
    </div>
  );
}
