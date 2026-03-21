import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useOnboard } from '../../context/OnboardContext'
import { Navbar } from '../../components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, Users, Zap, Search, 
  Lightbulb, ClipboardCheck, Calendar,
  ChevronRight, ArrowLeft, Info
} from 'lucide-react'

const STEP_COLORS = [
  '#22c55e', // Green
  '#f97316', // Orange
  '#ef4444', // Red
  '#a855f7', // Purple
  '#3b82f6', // Blue
  '#1e293b', // Navy
  '#14b8a6', // Teal
]

const STEP_ICONS = [
  Target, Users, Zap, Search, 
  Lightbulb, ClipboardCheck, Calendar
]

const RoadmapNode = ({ module, index, isActive, onClick }) => {
  const Icon = STEP_ICONS[index % STEP_ICONS.length]
  const color = STEP_COLORS[index % STEP_COLORS.length]
  const isEven = index % 2 === 1

  return (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        cursor: 'pointer',
        minWidth: '240px',
        paddingTop: isEven ? '120px' : '0',
        paddingBottom: !isEven ? '120px' : '0',
        transition: 'transform 0.3s ease'
      }}
      className="group"
    >
      {/* Label and Details (Zig-Zag) */}
      {!isEven && (
        <div style={{ marginBottom: '24px', textAlign: 'center', width: '200px' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '14px', color, marginBottom: '4px' }}>
            {String(index + 1).padStart(2, '0')}
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '16px', color: '#0f172a', lineHeight: 1.2 }}>
            {module.title}
          </div>
        </div>
      )}

      {/* The Bubble */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: `0 0 20px ${color}44`,
          border: '4px solid white',
          zIndex: 10,
          position: 'relative'
        }}
      >
        <Icon size={28} />
      </motion.div>

      {/* Label and Details (Zig-Zag) */}
      {isEven && (
        <div style={{ marginTop: '24px', textAlign: 'center', width: '200px' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '14px', color, marginBottom: '4px' }}>
            {String(index + 1).padStart(2, '0')}
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: '700', fontSize: '16px', color: '#0f172a', lineHeight: 1.2 }}>
            {module.title}
          </div>
        </div>
      )}

      {/* Dashed Line Connector (Visual only) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 'calc(50% + 40px)',
        width: '160px',
        height: '2px',
        background: `repeating-linear-gradient(90deg, #e2e8f0, #e2e8f0 4px, transparent 4px, transparent 8px)`,
        zIndex: 0,
        display: index === 6 ? 'none' : 'block'
      }} />
    </div>
  )
}

export default function Roadmap() {
  const { user } = useAuth()
  const { pathway: contextPathway } = useOnboard()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [session, setSession] = useState(null)
  const [pathway, setPathway] = useState([])
  const [selectedModule, setSelectedModule] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    let timer;
    const fetchRoadmap = async () => {
      // 1. Instant recovery from context if available
      if (contextPathway?.learning_pathway?.length > 0 && (!sessionId || sessionId === session?.id)) {
        console.log('⚡ Using context-cached pathway');
        setPathway(contextPathway.learning_pathway.slice(0, 7));
        if (contextPathway.learning_pathway[0]) {
           setSelectedModule(contextPathway.learning_pathway[0]);
        }
        setLoading(false);
        // We still continue to fetch latest from DB in background to stay synced
      }

      if (!user?.id) {
        return;
      }

      // Safety timeout after 10s (reduced from 15s)
      timer = setTimeout(() => {
        if (loading) {
          console.warn('⚠️ Roadmap fetch timed out after 10s');
          setError('timeout');
          setLoading(false);
        }
      }, 10000);

      try {
        let query = supabase
          .from('onboarding_sessions')
          .select('*')
          .eq('user_id', user.id);
        
        if (sessionId) {
          query = query.eq('id', sessionId);
        } else {
          query = query.order('created_at', { ascending: false }).limit(1);
        }

        const { data, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;

        if (!data || data.length === 0) {
          setError('no_session');
          setLoading(false);
          if (timer) clearTimeout(timer);
          return;
        }

        const latest = data[0];
        setSession(latest);

        const supabasePathway = latest.learning_pathway || [];
        const contextModules = contextPathway?.learning_pathway || [];
        const finalPathway = supabasePathway.length > 0 ? supabasePathway : contextModules
        
        setPathway(finalPathway.slice(0, 7));
        if (finalPathway[0]) {
          if (!selectedModule) setSelectedModule(finalPathway[0]);
        }
        
        setLoading(false);
        if (timer) clearTimeout(timer);

      } catch (err) {
        console.error('❌ Roadmap fetch caught exception:', err);
        // Only set error if we don't have cached data
        if (pathway.length === 0) {
          setError('fetch_failed');
          setLoading(false);
        }
        if (timer) clearTimeout(timer);
      }
    }

    fetchRoadmap();
    return () => { if (timer) clearTimeout(timer); };
  }, [user?.id, sessionId, contextPathway]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)', flexDirection: 'column', gap: '24px' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark" />
          <div style={{ textAlign: 'center' }}>
             <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '14px', color: '#64748b', margin: 0 }}>Preparing your roadmap...</p>
             <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
               {user ? `Authenticated as ${user.email}` : 'Checking authentication...'}
             </p>
          </div>
          {/* Debug skip if it's taking too long */}
          <button 
            onClick={() => setLoading(false)}
            style={{ fontSize: '11px', color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Not loading? Click here to bypass
          </button>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 60px)', flexDirection: 'column', gap: '20px' }}>
          <p className="font-headline text-xl font-bold">No Pathway Found</p>
          <button onClick={() => navigate('/upload')} className="bg-primary-dark text-white px-6 py-2 rounded-lg">Start Over</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', overflow: 'hidden' }}>
      <Navbar />

      <main style={{ padding: '40px 0', height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
        {/* Header Area */}
        <div style={{ padding: '0 40px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0ea5e9', marginBottom: '8px' }}>
            <Calendar size={18} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: '700', letterSpacing: '2px' }}>7 STEP GUIDE</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '42px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            How to create an <span style={{ color: '#f97316' }}>effective</span> {session.role_title || 'Technology'} Roadmap
          </h1>
        </div>

        {/* Wavy Timeline Area */}
        <div 
          ref={scrollRef}
          style={{ 
            flexGrow: 1, 
            overflowX: 'auto', 
            padding: '20px 40px',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          className="roadmap-scroll"
        >
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 'max-content', paddingRight: '100px' }}>
            {pathway.map((module, index) => (
              <RoadmapNode 
                key={module.id || index}
                index={index}
                module={module}
                isActive={selectedModule?.id === module.id}
                onClick={() => setSelectedModule(module)}
              />
            ))}
          </div>

          <style>{`.roadmap-scroll::-webkit-scrollbar { display: none; }`}</style>
        </div>

        {/* Info Panel */}
        <AnimatePresence mode="wait">
          {selectedModule && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              style={{
                position: 'fixed',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'calc(100% - 80px)',
                maxWidth: '900px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '24px',
                padding: '24px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                zIndex: 100
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STEP_COLORS[pathway.indexOf(selectedModule) % STEP_COLORS.length] }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                    MODULE {String(pathway.indexOf(selectedModule) + 1).padStart(2, '0')} — {selectedModule.domain || 'Core'}
                  </span>
                </div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0' }}>{selectedModule.title}</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', color: '#64748b', margin: 0, maxWidth: '600px' }}>{selectedModule.reasoning_trace || selectedModule.skill_taught}</p>
              </div>
              <div style={{ textAlign: 'right', minWidth: '150px' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '24px', color: '#0f172a' }}>{selectedModule.duration_minutes}m</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: '#64748b' }}>Estimated time</div>
                <button 
                  onClick={() => navigate(`/dashboard?session=${session.id}`)}
                  style={{ 
                    marginTop: '12px', 
                    background: '#0f172a', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 16px', 
                    borderRadius: '8px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Footer Controls */}
        <div style={{ position: 'fixed', bottom: '20px', right: '40px', display: 'flex', gap: '12px' }}>
           <button 
            onClick={() => navigate('/sessions')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-full hover:bg-slate-50 transition-colors shadow-sm"
           >
              <ArrowLeft size={16} />
              <span className="font-body text-xs font-semibold">Back to Sessions</span>
           </button>
        </div>
      </main>
    </div>
  )
}
