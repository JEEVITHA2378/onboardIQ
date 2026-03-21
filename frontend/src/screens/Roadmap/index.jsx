import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { ROUTES } from '../../constants/routes';
import { useOnboard } from '../../context/OnboardContext';
import { useAuth } from '../../context/AuthContext';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const ScoreRing = ({ score }) => {
  const size = 52
  const strokeWidth = 4
  const center = size / 2
  const radius = center - strokeWidth - 1
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexShrink: 0
    }}>
      {/* Ring */}
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'grid',
        placeItems: 'center',
        position: 'relative',
        flexShrink: 0
      }}>
        <svg
          width={size}
          height={size}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${center} ${center})`}
            style={{ transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        {/* Centered text using grid */}
        <span style={{
          position: 'relative',
          zIndex: 1,
          fontFamily: 'Syne, sans-serif',
          fontWeight: '800',
          fontSize: '12px',
          color: '#0f172a',
          lineHeight: 1,
          textAlign: 'center'
        }}>
          {score}%
        </span>
      </div>

      {/* Label beside ring */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '3px'
      }}>
        <span style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: '700',
          fontSize: '15px',
          color: '#0f172a',
          lineHeight: 1
        }}>
          SDE II
        </span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '9px',
          color: '#64748b',
          letterSpacing: '1.5px',
          textTransform: 'uppercase'
        }}>
          Job Readiness
        </span>
      </div>
    </div>
  )
}

export default function Roadmap() {
  const { pathway } = useOnboard();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('Graph View');
  const [selectedNode, setSelectedNode] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user || !sessionId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('onboarding_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setSessionData(data);
      } catch (err) {
        console.error('Roadmap load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessionData();
  }, [user, sessionId]);

  const data = sessionData || pathway || {
    modules: [
      { id: "mod1", title: "Advanced Python Algorithms", duration_minutes: 60, level: "advanced", skill_taught: "Python" },
      { id: "mod2", title: "System Design for APIs", duration_minutes: 45, level: "intermediate", skill_taught: "System Design" }
    ],
    gap_skills: ["Python", "System Design"],
    reasoning: [
      "Task traversal revealed suboptimal data structure mapping.",
      "Identified critical gaps in REST interface logic."
    ]
  };

  const [score, setScore] = useState(0);
  useEffect(() => {
    let timer = setTimeout(() => setScore(data?.job_readiness_score || 68), 100);
    return () => clearTimeout(timer);
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary-dark border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  const { nodes, edges } = useMemo(() => {
    const nds = [];
    const eds = [];
    const startX = 300;
    
    data.modules.forEach((mod, idx) => {
      // Determine bar color
      let barColor = '#f59e0b'; // amber moderate gap
      if (mod.level === 'advanced') barColor = '#ef4444'; // red critical
      if (idx === data.modules.length - 1) barColor = '#10b981'; // green proven/final
      
      nds.push({
        id: mod.id,
        position: { x: startX, y: idx * 140 + 50 },
        data: { 
          label: (
            <div 
              className="bg-white border border-border rounded-[10px] py-[14px] px-[18px] w-[260px] text-left relative overflow-hidden shadow-soft cursor-pointer hover:border-border-strong transition-colors"
              onClick={() => setSelectedNode(mod)}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: barColor }} />
              <div className="ml-1">
                <div className="font-headline text-[13px] text-primary-dark font-semibold leading-snug mb-2">{mod.title}</div>
                <div className="font-mono text-[11px] text-[#64748b] bg-surface inline-block px-1.5 py-0.5 rounded flex items-center gap-2">
                  <span>{mod.duration_minutes}m</span>
                  <span>·</span>
                  <span className="capitalize">{mod.level}</span>
                </div>
              </div>
            </div>
          ) 
        },
        type: 'default',
        style: { width: 260, border: 'none', background: 'transparent', padding: 0 }
      });
      
      if (idx > 0) {
        eds.push({
          id: `e-${data.modules[idx-1].id}-${mod.id}`,
          source: data.modules[idx-1].id,
          target: mod.id,
          animated: true,
          style: { stroke: '#cbd5e1', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#0ea5e9' },
        });
      }
    });
    return { nodes: nds, edges: eds };
  }, [data]);

  return (
    <div className="flex flex-col h-screen bg-[#f8fafc] overflow-hidden">
      <Navbar />
      
      {/* Top Summary Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px'
      }}>
        <ScoreRing score={score} />

        {/* Center chips */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '20px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: '700',
              fontSize: '14px',
              color: '#166534'
            }}>
              12
            </span>
            <span style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
              color: '#166534'
            }}>
              Skills Proven
            </span>
          </div>

          <div style={{
            background: '#fef9c3',
            border: '1px solid #fde68a',
            borderRadius: '20px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: '700',
              fontSize: '14px',
              color: '#854d0e'
            }}>
              {data.gap_skills?.length || 0}
            </span>
            <span style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
              color: '#854d0e'
            }}>
              Gaps Identified
            </span>
          </div>
        </div>

        {/* Right toggle */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          borderRadius: '8px',
          padding: '3px'
        }}>
          {['Graph View', 'Timeline View'].map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                border: view === tab
                  ? '1px solid #e2e8f0' : 'none',
                background: view === tab
                  ? '#ffffff' : 'transparent',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                fontWeight: view === tab ? '600' : '400',
                color: view === tab ? '#0f172a' : '#64748b',
                cursor: 'pointer',
                transition: 'all 150ms'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-grow relative flex overflow-hidden">
        
        {view === 'Graph View' ? (
          <div className="flex-1 relative bg-white">
            <ReactFlow nodes={nodes} edges={edges} fitView proOptions={{ hideAttribution: true }}>
              <Background gap={24} size={1} color="#e2e8f0" />
              <Controls showInteractive={false} className="border-border bg-white fill-primary-dark rounded-[8px] shadow-soft" />
            </ReactFlow>

            <AnimatePresence>
              {selectedNode && (
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="absolute right-0 top-0 bottom-0 w-[380px] bg-white border-l border-border shadow-soft z-20 flex flex-col pt-[72px]" 
                  // Note: The parent container is full height minus Navbar and Summary bar.
                >
                  <button onClick={() => setSelectedNode(null)} className="absolute right-6 top-6 text-muted hover:text-primary-dark">✕</button>
                  <div className="px-8 pt-8 pb-4">
                    <h2 className="font-headline text-[18px] font-bold text-primary-dark mb-4 leading-tight">{selectedNode.title}</h2>
                    <div className="flex gap-2">
                      <span className="bg-[#f1f5f9] text-muted font-mono text-[11px] px-2 py-1 rounded">{selectedNode.duration_minutes}m duration</span>
                      <span className="bg-[#fee2e2] text-[#991b1b] font-mono text-[11px] px-2 py-1 rounded capitalize">{selectedNode.level} difficulty</span>
                    </div>
                  </div>
                  <div className="px-8 py-6 bg-[#f8fafc] border-y border-border m-8 rounded-lg relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-accent-blue" />
                    <h3 className="font-mono text-[10px] text-muted uppercase tracking-widest mb-2">Reasoning Trace</h3>
                    <p className="font-body text-[14px] italic text-primary-dark leading-relaxed">
                      Based on empirical observation from Task 01, resolving the edge case highlighted an uncertainty with foundational {selectedNode.skill_taught}. This module was injected to bridge the cognitive friction points detected during syntax formulation.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-10 flex justify-center">
            <div className="max-w-3xl w-full flex flex-col gap-4">
              {data.modules.map((mod, i) => {
                const expanded = expandedItems[i];
                let barColor = '#f59e0b';
                if (mod.level === 'advanced') barColor = '#ef4444';
                if (i === data.modules.length - 1) barColor = '#10b981';

                return (
                  <div key={i} className="bg-white border border-border rounded-[12px] p-5 shadow-soft relative overflow-hidden transition-all">
                    <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ backgroundColor: barColor }} />
                    <div 
                      className="ml-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                      onClick={() => setExpandedItems(p => ({ ...p, [i]: !p[i] }))}
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[10px] bg-[#f1f5f9] text-muted px-2 py-1 rounded">MOD {String(i+1).padStart(2, '0')}</span>
                        <h3 className="font-headline text-[15px] font-semibold text-primary-dark">{mod.title}</h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[11px] text-[#64748b] bg-surface px-2 py-1 rounded">{mod.duration_minutes}m</span>
                        {expanded ? <ChevronUp className="w-5 h-5 text-muted" /> : <ChevronDown className="w-5 h-5 text-muted" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-2 mt-4 px-5 py-4 bg-[#f8fafc] border border-border rounded-lg relative overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-accent-blue" />
                          <h3 className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1.5">Reasoning Trace</h3>
                          <p className="font-body text-[14px] italic text-[#64748b] leading-relaxed">
                            Required due to observed gaps in {mod.skill_taught} proficiency relative to Senior standard.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </main>

      {/* Sticky Bottom Banner */}
      <div className="h-[60px] bg-white border-t border-border flex items-center justify-center shadow-[0_-4px_16px_rgba(0,0,0,0.02)] z-30">
        <div className="px-6 py-2">
          <span className="font-body text-[#64748b] text-[14px]">You saved </span>
          <span className="font-headline font-bold text-accent-blue text-[16px]">142 hours</span>
          <span className="font-body text-[#64748b] text-[14px]"> of irrelevant training ($11,400 business value).</span>
        </div>
      </div>
    </div>
  );
}
