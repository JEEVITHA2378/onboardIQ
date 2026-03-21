import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { Navbar } from '../../components/Navbar'

const ScoreRing = ({ score }) => {
  const size = 56
  const strokeWidth = 4
  const center = size / 2
  const radius = center - strokeWidth - 1
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  return (
    <div style={{
      width: `${size}px`, height: `${size}px`,
      display: 'grid', placeItems: 'center',
      position: 'relative', flexShrink: 0
    }}>
      <svg width={size} height={size}
        style={{ position: 'absolute', top: 0, left: 0 }}>
        <circle cx={center} cy={center} r={radius}
          fill="none" stroke="#e2e8f0"
          strokeWidth={strokeWidth} />
        <circle cx={center} cy={center} r={radius}
          fill="none" stroke="#0ea5e9"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`} />
      </svg>
      <span style={{
        position: 'relative', zIndex: 1,
        fontFamily: 'Syne, sans-serif',
        fontWeight: '700', fontSize: '11px',
        color: '#0f172a', lineHeight: 1
      }}>
        {score}%
      </span>
    </div>
  )
}

export default function Sessions() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Add 5 second timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 5000)

    const fetchSessions = async () => {
      if (!user?.id) {
        clearTimeout(timeout)
        setLoading(false)
        return
      }
      try {
        const { data, error } = await supabase
          .from('onboarding_sessions')
          .select('id, role_title, status, job_readiness_score, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        clearTimeout(timeout)
        if (error) throw error
        setSessions(data || [])
      } catch (err) {
        console.error('Sessions error:', err)
        setSessions([])
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }

    // Wait for user to be available
    if (user?.id) {
      fetchSessions()
    } else {
      // Try again after 2 seconds if user not ready
      const retry = setTimeout(() => {
        fetchSessions()
      }, 2000)
      return () => {
        clearTimeout(timeout)
        clearTimeout(retry)
      }
    }

    return () => clearTimeout(timeout)
  }, [user?.id])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
        <Navbar />
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          height: 'calc(100vh - 60px)', gap: '16px'
        }}>
          <div style={{
            width: '32px', height: '32px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#0f172a',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Navbar />
      <div style={{
        maxWidth: '800px', margin: '0 auto',
        padding: '40px 24px'
      }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '32px', fontWeight: '700',
          color: '#0f172a', marginBottom: '8px'
        }}>
          Your Sessions.
        </h1>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '13px', color: '#64748b',
          marginBottom: '32px'
        }}>
          All your onboarding assessments in one place.
        </p>

        {sessions.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px', padding: '60px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>
              🗂️
            </div>
            <p style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '18px', fontWeight: '600',
              color: '#0f172a', marginBottom: '8px'
            }}>
              No sessions yet.
            </p>
            <p style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px', color: '#64748b',
              marginBottom: '24px'
            }}>
              Upload your first resume to generate a pathway.
            </p>
            <button
              onClick={() => navigate('/upload')}
              style={{
                background: '#0f172a', color: '#ffffff',
                border: 'none', borderRadius: '10px',
                padding: '12px 28px',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '14px', fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Begin Now →
            </button>
          </div>
        ) : (
          sessions.map(session => (
            <div key={session.id} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px 24px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              transition: 'box-shadow 200ms'
            }}
              onMouseEnter={e =>
                e.currentTarget.style.boxShadow =
                  '0 8px 24px rgba(0,0,0,0.08)'}
              onMouseLeave={e =>
                e.currentTarget.style.boxShadow = 'none'}
            >
              <ScoreRing
                score={session.job_readiness_score || 0}
              />
              <div style={{ flex: 1 }}>
                <p style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: '700', fontSize: '16px',
                  color: '#0f172a', margin: '0 0 4px'
                }}>
                  {session.role_title || 'Assessment'}
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px', color: '#64748b'
                  }}>
                    {new Date(session.created_at)
                      .toLocaleDateString('en-US', {
                        month: 'short', day: '2-digit',
                        year: 'numeric'
                      })}
                  </span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px', fontWeight: '600',
                    padding: '2px 10px', borderRadius: '4px',
                    background: session.status === 'completed'
                      ? '#dcfce7' : '#fef9c3',
                    color: session.status === 'completed'
                      ? '#166534' : '#854d0e'
                  }}>
                    {session.status === 'completed'
                      ? 'COMPLETED' : 'IN PROGRESS'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(
                  session.status === 'completed'
                    ? '/dashboard' : '/simulation'
                )}
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
                  fontSize: '14px', fontWeight: '500',
                  cursor: 'pointer', whiteSpace: 'nowrap'
                }}
              >
                {session.status === 'completed'
                  ? 'View Results' : 'Resume Session'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
