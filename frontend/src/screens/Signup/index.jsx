import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';
import { Button } from '../../components/Button';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    try {
      const { error: signUpError } = await signup(email, password, { full_name: name });
      if (signUpError) throw signUpError;
      
      setSuccess("Check your email to verify your account");
      setTimeout(() => navigate(ROUTES.LOGIN), 2000);
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="hidden lg:flex flex-col w-1/2 bg-surface p-12 relative overflow-hidden">
        <div className="font-headline font-bold text-xl text-primary-dark">OnboardIQ+</div>
        
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
          <h1 className="font-headline text-[52px] leading-tight text-primary-dark mb-6 relative z-10">
            Prove what you <span className="relative">know.<svg className="absolute w-full h-3 -bottom-1 left-0 text-accent-blue" viewBox="0 0 100 10" preserveAspectRatio="none"><motion.path d="M0 5 Q 50 10 100 2" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.2 }}/></svg></span>
          </h1>
          
          <div className="w-10 h-px bg-primary-dark mb-6" />
          
          <p className="font-body text-xl text-muted mb-12">Real work. Real signals. Real path.</p>
          
          <div className="space-y-6">
            {[
              { title: "Skill Proof over Self-Report.", desc: "We track empirical capability through simulated tasks." },
              { title: "Cognitive Load Awareness.", desc: "Telemetry reveals friction points, not just pass/fail." },
              { title: "Retroactive Path from Real Behaviour.", desc: "Curriculum generated bottom-up from observed gaps." }
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2 bg-primary-dark flex-shrink-0" />
                <div>
                  <h3 className="font-headline font-bold text-primary-dark text-lg">{feature.title}</h3>
                  <p className="font-body text-muted mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-8 flex items-center gap-4">
          <div className="flex -space-x-3">
            {['SJ', 'MR', 'AL', 'KT', 'DB'].map((initials, i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-primary-dark border-2 border-surface flex items-center justify-center text-white font-body text-xs font-bold shadow-sm z-10 relative">
                {initials}
              </div>
            ))}
          </div>
          <span className="font-body text-sm text-muted">Join 2,400+ professionals onboarded.</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 bg-surface flex flex-col justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-[440px] mx-auto bg-card border border-border p-11 rounded-[16px] shadow-soft">
          <h2 className="font-headline text-[26px] text-primary-dark mb-2">Create Account.</h2>
          <p className="font-body text-muted mb-8">Begin your empirical onboarding trace.</p>

          {success && (
            <div className="bg-[#dcfce7] text-[#166534] p-3 rounded-lg mb-6 font-body text-sm flex items-center gap-2 border border-[#bbf7d0]">
              <div className="w-2 h-2 rounded-full bg-green" /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Full Name', type: 'text', state: name, setter: setName, placeholder: 'Jane Doe' },
              { label: 'Work Email', type: 'email', state: email, setter: setEmail, placeholder: 'name@company.com' },
              { label: 'Password', type: showPassword ? 'text' : 'password', state: password, setter: setPassword, placeholder: '••••••••', isPassword: true },
              { label: 'Confirm Password', type: showPassword ? 'text' : 'password', state: confirmPassword, setter: setConfirmPassword, placeholder: '••••••••' }
            ].map((field, i) => (
              <div key={i} className="space-y-1.5 relative">
                <label className="text-[11px] uppercase tracking-wider font-mono text-muted">{field.label}</label>
                <div className="relative">
                  <input 
                    type={field.type} 
                    required
                    value={field.state}
                    onChange={(e) => field.setter(e.target.value)}
                    className="w-full bg-white border border-border rounded-lg px-3.5 py-2.5 text-primary-dark focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all font-body text-sm placeholder:text-[#94a3b8]"
                    placeholder={field.placeholder}
                  />
                  {field.isPassword && (
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary-dark font-body text-xs"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {error && <div className="text-red text-sm font-body mt-1">{error}</div>}

            <Button type="submit" disabled={loading} className="w-full h-12 mt-6 rounded-[10px] font-bold">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Create Account →'}
            </Button>
          </form>

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
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84 C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="mt-8 text-center text-sm text-muted font-body">
            Already have an account? <Link to={ROUTES.LOGIN} className="text-accent-blue hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
