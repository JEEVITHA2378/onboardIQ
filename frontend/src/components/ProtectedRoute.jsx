import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get real session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session || !session.user) {
          setAuthenticated(false)
          setChecking(false)
          return
        }

        // Verify user still exists in profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single()

        if (profileError || !profile) {
          // User deleted — sign out and redirect
          await supabase.auth.signOut()
          setAuthenticated(false)
          setChecking(false)
          return
        }

        setAuthenticated(true)
        setChecking(false)

      } catch (err) {
        setAuthenticated(false)
        setChecking(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setAuthenticated(false)
        } else if (event === 'SIGNED_IN' && session) {
          setAuthenticated(true)
        } else if (event === 'USER_DELETED') {
          await supabase.auth.signOut()
          setAuthenticated(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Show loading spinner while checking
  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#0f172a',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
            color: '#64748b'
          }}>
            Verifying session...
          </p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Not authenticated — redirect to login
  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  // Authenticated — show the protected page
  return children
}
