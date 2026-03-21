import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Navbar } from '../../components/Navbar'

const ScoreRing = ({ score }) => {
  const size = 52
  const strokeWidth = 4
  const center = size / 2
  const radius = center - strokeWidth - 1
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
      <div style={{ width: `${size}px`, height: `${size}px`, display: 'grid', placeItems: 'center', position: 'relative' }}>
        <svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#0ea5e9" strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(-90 ${center} ${center})`} style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        </svg>
        <span style={{ position: 'relative', zIndex: 1, fontFamily: 'Syne, sans-serif', fontWeight: '800', fontSize: '12px', color: '#0f172a' }}>
          {score}%
        </span>
      </div>
    </div>
  )
}

const ModuleCard = ({ module, index }) => (
  <div style={{
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }}>
    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, w: '4px', background: module.level === 'advanced' ? '#ef4444' : '#10b981' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px' }}>
          MODULE {String(index + 1).padStart(2, '0')}
        </span>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '8px 0 4px 0' }}>{module.title}</h3>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: '#64748b', margin: 0 }}>{module.skill_taught}</p>
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#64748b' }}>
        {module.duration_minutes}m
      </div>
    </div>
  </div>
)

export default function Roadmap() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [session, setSession] = useState(null)
  const [pathway, setPathway] = useState([])
  const [activeView, setActiveView] = useState('Timeline View')

  useEffect(() => {
    const fetchSession = async () => {
      if (!user) return
      try {
        setLoading(true)
        let query = supabase
          .from('onboarding_sessions')
          .select('*')
          .eq('user_id', user.id)

        if (sessionId) {
          query = query.eq('id', sessionId)
        } else {
          query = query.order('created_at', { ascending: false }).limit(1)
        }

        const { data, error } = await query.single()

        if (error) {
          setError('No roadmap found. Please complete an assessment first.')
          setLoading(false)
          return
        }

        setSession(data)
        setPathway(data?.learning_pathway || [])
        setLoading(false)

      } catch (err) {
        setError('Failed to load roadmap. Please try again.')
        setLoading(false)
      }
    }
    fetchSession()
  }, [user, sessionId])

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 60px)',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: '36px', height: '36px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#0f172a',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px', color: '#64748b'
          }}>
            Loading your roadmap...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
        </div>
      </div>
    )
  }

  // Error state — no session found
  if (error || !session) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 60px)',
          flexDirection: 'column',
          gap: '20px',
          padding: '32px'
        }}>
          <div style={{
            width: '64px', height: '64px',
            background: '#f1f5f9',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            🗺️
          </div>
          <p style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: '20px',
            fontWeight: '700',
            color: '#0f172a',
            margin: 0
          }}>
            No Roadmap Yet
          </p>
          <p style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            color: '#64748b',
            textAlign: 'center',
            maxWidth: '320px',
            margin: 0
          }}>
            Complete your first assessment to see your
            personalised learning roadmap here.
          </p>
          <button
            onClick={() => navigate('/upload')}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 28px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Start Assessment →
          </button>
        </div>
      </div>
    )
  }

  // Main roadmap content
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />

      {/* Sticky Header Bar */}
      <div style={{
        position: 'sticky', top: '60px', zIndex: 50,
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px'
      }}>
        {/* Score Ring */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <ScoreRing score={session.job_readiness_score || 0} />
          <div>
            <p style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: '700', fontSize: '15px',
              color: '#0f172a', margin: 0
            }}>
              {session.role_title || 'Your Role'}
            </p>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '9px', color: '#64748b',
              letterSpacing: '1.5px',
              textTransform: 'uppercase', margin: 0
            }}>
              Job Readiness
            </p>
          </div>
        </div>

        {/* Center Chips */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{
            background: '#dcfce7', border: '1px solid #bbf7d0',
            borderRadius: '20px', padding: '6px 14px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{
              fontFamily: 'Syne, sans-serif', fontWeight: '700',
              fontSize: '14px', color: '#166534'
            }}>
              {session.skills_proven?.length || 0}
            </span>
            <span style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px', color: '#166534'
            }}>
              Skills Proven
            </span>
          </div>
          <div style={{
            background: '#fef9c3', border: '1px solid #fde68a',
            borderRadius: '20px', padding: '6px 14px',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{
              fontFamily: 'Syne, sans-serif', fontWeight: '700',
              fontSize: '14px', color: '#854d0e'
            }}>
              {session.skill_gaps?.length || 0}
            </span>
            <span style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px', color: '#854d0e'
            }}>
              Gaps Identified
            </span>
          </div>
        </div>

        {/* Toggle */}
        <div style={{
          display: 'flex', background: '#f1f5f9',
          borderRadius: '8px', padding: '3px'
        }}>
          {['Graph View', 'Timeline View'].map(view => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              style={{
                padding: '6px 16px', borderRadius: '6px',
                border: activeView === view
                  ? '1px solid #e2e8f0' : 'none',
                background: activeView === view
                  ? '#ffffff' : 'transparent',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                fontWeight: activeView === view ? '600' : '400',
                color: activeView === view ? '#0f172a' : '#64748b',
                cursor: 'pointer'
              }}
            >
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Pathway Content */}
      <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        {pathway.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 0'
          }}>
            <p style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '18px', color: '#0f172a',
              fontWeight: '600'
            }}>
              Your pathway is being generated...
            </p>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px', color: '#64748b'
            }}>
              Complete a simulation to generate your roadmap.
            </p>
            <button
              onClick={() => navigate('/simulation')}
              style={{
                background: '#0f172a', color: '#ffffff',
                border: 'none', borderRadius: '10px',
                padding: '12px 28px', marginTop: '16px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px', fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Go to Simulation →
            </button>
          </div>
        ) : (
          pathway.map((module, index) => (
            <ModuleCard
              key={module.id || index}
              module={module}
              index={index}
            />
          ))
        )}
      </div>

      {/* Bottom Banner */}
      {session.time_saved_hours > 0 && (
        <div style={{
          position: 'sticky', bottom: 0,
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: '12px 32px',
          textAlign: 'center'
        }}>
          <span style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px', color: '#64748b'
          }}>
            You saved{' '}
            <strong style={{
              color: '#0ea5e9',
              fontFamily: 'Syne, sans-serif'
            }}>
              {session.time_saved_hours} hours
            </strong>
            {' '}of irrelevant training.
          </span>
        </div>
      )}
    </div>
  )
}
