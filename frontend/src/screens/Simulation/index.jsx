import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { ROUTES } from '../../constants/routes';
import { useOnboard } from '../../context/OnboardContext';
import api, { submitSimulation } from '../../services/api';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../../components/Navbar';

import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

export default function Simulation() {
  const { simulationTasks, setPathway, sessionId } = useOnboard();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0);
  const [code, setCode] = useState('// Write your solution here\n');
  const [submitting, setSubmitting] = useState(false);
  const [time, setTime] = useState(new Date());
  
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [hintsRequested, setHintsRequested] = useState(0);

  const tasks = simulationTasks?.length ? simulationTasks : [
    { id: "fallback", title: "API Authentication", type: "code", description: "Implement a JWT validation middleware function in Node.js that checks the Authorization header and verifies the token against the secret." }
  ];
  const task = tasks[currentTaskIdx];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleHintClick = async () => {
    setShowHint(true);
    setHintLoading(true);
    
    // Log hint request to telemetry silently
    setHintsRequested(prev => prev + 1);
    
    // Generate hint from current task
    try {
      const response = await api.post('/api/hint', {
        task_id: task.id || "fallback",
        task_title: task.title,
        task_description: task.description
      });
      setHintText(response.data.hint);
    } catch {
      setHintText('Think about the core concept being tested in this task. Break the problem into smaller steps and tackle each one individually.');
    } finally {
      setHintLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentTaskIdx < tasks.length - 1) {
      setCurrentTaskIdx(p => p + 1);
      setCode('// Write your solution here\n');
    } else {
      setSubmitting(true);
      try {
        const telemetryLog = [{
          task_id: task.id || "fallback",
          time_spent_seconds: 120,
          hints_requested: hintsRequested,
          errors_made: 0,
          retry_count: 0,
          task_abandoned: false,
          submitted_answer: code
        }];

        // POST telemetry to backend
        const response = await submitSimulation({
          session_id: sessionId || "demo-session",
          user_id: user.id || "demo-user",
          telemetry: telemetryLog
        });

        // Save session to Supabase with completed status
        const { error } = await supabase
          .from('onboarding_sessions')
          .upsert({
            id: sessionId || "demo-session",
            user_id: user.id,
            status: 'completed',
            job_readiness_score: response?.data?.readiness_score || 72,
            skills_proven: response?.data?.skills_proven || [],
            skill_gaps: response?.data?.skill_gaps || [],
            learning_pathway: response?.data?.pathway || [],
            reasoning_trace: response?.data?.reasoning_trace || [],
            time_saved_hours: response?.data?.time_saved_hours || 0
          });

        if (error) {
          console.error('Failed to save session:', error);
        }

        navigate(ROUTES.ANALYSING);
      } catch (err) {
        console.error('Final submit failed:', err);
        navigate(ROUTES.ANALYSING);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <Navbar />
      
      {/* Top Bar */}
      <div className="h-[56px] border-b border-border bg-white z-40 px-6 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="font-headline font-semibold text-base text-primary-dark">
          Software Engineer — Day 1.
        </div>
        <div className="font-mono text-[13px] text-[#94a3b8]">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-8 overflow-hidden bg-transparent">
        <div className="w-full max-w-[65%] h-full flex flex-col items-center">
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentTaskIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-card border border-border shadow-soft rounded-[14px] p-11 flex flex-col h-full max-h-[800px]"
            >
              {/* Task Header */}
              <div className="mb-6 flex items-start flex-col gap-3">
                <div className="bg-[#e0f2fe] text-accent-blue px-2.5 py-0.5 rounded-[4px] font-mono text-[10px] uppercase tracking-wider font-bold">
                  Task 0{currentTaskIdx + 1}
                </div>
                <h2 className="text-[22px] font-headline font-bold text-primary-dark">{task.title}</h2>
                <p className="font-body text-[15px] text-muted leading-[1.7]">{task.description}</p>
              </div>
              
              {/* Editor/Input Area */}
              <div className="flex-grow w-full border border-border rounded-lg overflow-hidden bg-white mb-6">
                {showHint && (
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="p-4 border-b border-[#e2e8f0] bg-[#f8fafc]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#64748b] uppercase tracking-wider font-mono">
                        Hint
                      </span>
                      <button
                        onClick={() => setShowHint(false)}
                        className="text-xs text-[#94a3b8] hover:text-[#64748b]"
                      >
                        Dismiss
                      </button>
                    </div>
                    {hintLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-[#94a3b8] border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-[#64748b] font-mono">
                          Generating hint...
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-[#0f172a] leading-relaxed">{hintText}</p>
                    )}
                  </motion.div>
                )}
                {task.type === 'code' ? (
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="light"
                    value={code}
                    onChange={(val) => setCode(val)}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: '"JetBrains Mono", monospace',
                      padding: { top: 16 },
                      lineNumbers: 'on',
                      scrollBeyondLastLine: false,
                    }}
                  />
                ) : (
                  <textarea 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full bg-[#f8fafc] p-4 font-body text-[14px] text-primary-dark focus:outline-none placeholder:text-[#94a3b8] resize-none"
                    placeholder="Draft your response here..."
                  />
                )}
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-2">
                <button 
                  onClick={handleHintClick}
                  className="font-body text-[13px] text-muted hover:text-primary-dark underline cursor-pointer bg-transparent border-none transition-colors"
                >
                  Need a hint?
                </button>
                <Button onClick={handleNext} disabled={submitting} className="px-8 rounded-lg">
                  Submit →
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}
