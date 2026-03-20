import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../../components/Navbar'
import { ROUTES } from '../../constants/routes'

const ScoreRing = ({ score }) => {
  const size = 80
  const strokeWidth = 6
  const center = size / 2
  const radius = center - strokeWidth
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (score / 100) * circumference

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      position: 'relative',
      flexShrink: 0,
      display: 'grid',
      placeItems: 'center'
    }}>
      <svg
        width={size}
        height={size}
        style={{
          position: 'absolute',
          top: 0,
          left: 0
        }}
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
          strokeDashoffset={progress}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <span style={{
        position: 'relative',
        zIndex: 1,
        fontFamily: 'Syne, sans-serif',
        fontWeight: '700',
        fontSize: '14px',
        color: '#0f172a',
        lineHeight: 1,
        textAlign: 'center',
        display: 'block'
      }}>
        {score}%
      </span>
    </div>
  )
}

export default function Sessions() {
  const navigate = useNavigate()

  const sessions = [
    { 
      id: '1', 
      role_title: 'Staff Software Engineer', 
      created_at: '2026-03-20T14:30:00Z', 
      status: 'completed', 
      job_readiness_score: 82 
    },
    { 
      id: '2', 
      role_title: 'Data Scientist II', 
      created_at: '2026-02-12T09:00:00Z', 
      status: 'completed', 
      job_readiness_score: 94 
    },
    { 
      id: '3', 
      role_title: 'Frontend Lead', 
      created_at: '2025-11-05T12:00:00Z', 
      status: 'in_progress', 
      job_readiness_score: 45 
    }
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      <Navbar />
      
      <main className="max-w-[700px] w-full mx-auto px-6 py-12 flex-grow">
        <header className="mb-10 text-center sm:text-left">
          <h1 className="font-headline text-[32px] font-bold text-primary-dark mb-2">Your Sessions.</h1>
          <p className="font-mono text-[13px] text-[#64748b]">All your onboarding assessments in one place.</p>
        </header>

        {sessions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {sessions.map(session => (
              <div key={session.id} style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                marginBottom: '12px',
                transition: 'box-shadow 200ms'
              }}
              className="hover:shadow-lg"
              onMouseEnter={e =>
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'}
              onMouseLeave={e =>
                e.currentTarget.style.boxShadow = 'none'}
              >
                {/* Score Ring — perfectly centered */}
                <ScoreRing score={session.job_readiness_score || 0} />

                {/* Session Info */}
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: '700',
                    fontSize: '16px',
                    color: '#0f172a',
                    margin: '0 0 4px'
                  }}>
                    {session.role_title}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '12px',
                      color: '#64748b'
                    }}>
                      {new Date(session.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: '2-digit', year: 'numeric'
                      })}
                    </span>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '11px',
                      fontWeight: '600',
                      padding: '2px 10px',
                      borderRadius: '4px',
                      background: session.status === 'completed'
                        ? '#dcfce7' : '#fef9c3',
                      color: session.status === 'completed'
                        ? '#166534' : '#854d0e'
                    }}>
                      {session.status === 'completed' ? 'COMPLETED' : 'IN PROGRESS'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => session.status === 'completed'
                    ? navigate(`/dashboard?session=${session.id}`)
                    : navigate('/simulation')
                  }
                  style={{
                    background: session.status === 'completed'
                      ? '#0f172a' : '#ffffff',
                    color: session.status === 'completed'
                      ? '#ffffff' : '#0f172a',
                    border: session.status === 'completed'
                      ? 'none' : '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '10px 20px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 200ms'
                  }}
                >
                  {session.status === 'completed' ? 'View Results' : 'Resume Session'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-border rounded-[12px] shadow-sm mt-8">
            <div className="w-16 h-16 bg-[#f1f5f9] rounded-full mb-4 flex items-center justify-center">
              <span className="font-headline text-2xl text-muted">0</span>
            </div>
            <h2 className="font-headline text-[18px] font-bold text-primary-dark mb-1">No sessions yet.</h2>
            <p className="font-body text-[#64748b] mb-6 text-sm">Upload your first resume to generate a pathway.</p>
            <button 
              onClick={() => navigate(ROUTES.UPLOAD)}
              className="px-6 h-[44px] bg-primary-dark text-white rounded-[8px] font-body text-[14px] font-semibold hover:bg-[#1e293b] transition-colors"
            >
              Begin Now →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
