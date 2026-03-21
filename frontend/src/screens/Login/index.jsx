import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate fields not empty
      if (!email || !password) {
        setError('Email and password are required')
        setLoading(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      // Attempt Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })

      // Handle Supabase errors
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email before signing in.')
        } else if (error.message.includes('User not found')) {
          setError('No account found with this email.')
        } else {
          setError(error.message || 'Sign in failed. Please try again.')
        }
        setLoading(false)
        return
      }

      // Check if user session is valid
      if (!data.session || !data.user) {
        setError('Authentication failed. Please try again.')
        setLoading(false)
        return
      }

      // Check if user exists in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        // User deleted from profiles — sign them out
        await supabase.auth.signOut()
        setError('Account not found. Please create a new account.')
        setLoading(false)
        return
      }

      // Success — navigate to dashboard
      navigate('/dashboard')

    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard'
        }
      })
      if (error) throw error
    } catch (err) {
      setError(err.message || 'Google sign in failed')
      setGoogleLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-surface p-12 relative overflow-hidden items-center justify-center">
        {/* Mock Graphic */}
        <div className="absolute w-[600px] h-[400px] right-[-100px] top-[20%] opacity-70 blur-[4px] pointer-events-none">
          <div className="bg-white border border-border rounded-xl p-8 shadow-sm">
            <div className="w-24 h-24 rounded-full border-8 border-accent-blue/20 border-r-accent-blue mb-8" />
            <div className="space-y-4">
              <div className="h-4 w-full bg-surface rounded-full overflow-hidden flex"><div className="w-3/4 bg-green h-full" /></div>
              <div className="h-4 w-full bg-surface rounded-full overflow-hidden flex"><div className="w-1/2 bg-accent-blue h-full" /></div>
            </div>
            <div className="mt-6 font-mono text-[10px] text-muted">
              {`> function resolveGap() { return new Pathway(); }`}
            </div>
          </div>
        </div>

        {/* Floating Glass Card */}
        <div className="relative z-10 w-full max-w-[340px] bg-white/60 backdrop-blur-xl border border-border p-8 rounded-card shadow-soft">
          <p className="font-headline italic text-primary-dark text-xl leading-relaxed border-l-[3px] border-primary-dark pl-4">
             Pick up exactly where you left off.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 bg-surface flex flex-col justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-[440px] mx-auto bg-card border border-border p-11 rounded-[16px] shadow-soft">
          <h2 className="font-headline text-[28px] text-primary-dark mb-2">Welcome back.</h2>
          <p className="font-body text-muted mb-8">Resume your OnboardIQ+ journey.</p>

          {error && (
            <div className="bg-[#fef2f2] text-red p-3 rounded-lg mb-6 font-body text-sm border border-[#fecaca] flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-red flex-shrink-0" /> {error}
            </div>
          )}
          
          {success && (
            <div className="bg-[#dcfce7] text-[#166534] p-3 rounded-lg mb-6 font-body text-sm border border-[#bbf7d0]">
               {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5 align-right">
              <label className="text-[11px] uppercase tracking-wider font-mono text-muted">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-border rounded-lg px-3.5 py-2.5 text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all font-body text-sm"
              />
            </div>
            
            {!resetMode && (
              <div className="space-y-1.5 relative">
                 <div className="flex justify-between items-center">
                   <label className="text-[11px] uppercase tracking-wider font-mono text-muted">Password</label>
                   <button type="button" onClick={() => setResetMode(true)} className="text-[13px] font-body text-accent-blue hover:underline">Forgot Password?</button>
                 </div>
                 
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-border rounded-lg px-3.5 py-2.5 text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all font-body text-sm"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary-dark font-body text-xs"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-12 mt-6 rounded-[10px] font-bold">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (resetMode ? 'Send Reset Link →' : 'Sign In →')}
            </Button>
          </form>

          {!resetMode && (
            <>
              <div className="flex items-center gap-4 my-6">
                <div className="h-px bg-border flex-1" />
                <span className="font-body text-muted text-sm">or</span>
                <div className="h-px bg-border flex-1" />
              </div>

              <button
                onClick={handleGoogleSignup}
                disabled={googleLoading}
                style={{
                  width: '100%',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#0f172a',
                  cursor: googleLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 200ms',
                  opacity: googleLoading ? 0.7 : 1,
                  boxSizing: 'border-box'
                }}
                onMouseEnter={e => {
                  if (!googleLoading) {
                    e.currentTarget.style.borderColor = '#cbd5e1'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {googleLoading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #e2e8f0',
                      borderTopColor: '#0f172a',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                      flexShrink: 0
                    }} />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26
                        1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92
                        3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66
                        -2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84
                        C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35
                        -2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18
                        4.93l3.66-2.84z"/>
                      <path fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45
                        2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66
                        2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </>
          )}

          <p className="mt-8 text-center text-sm text-muted font-body">
            New to OnboardIQ+? <Link to={ROUTES.SIGNUP} className="text-accent-blue hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
