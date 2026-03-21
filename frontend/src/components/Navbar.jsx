import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const Navbar = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (err) {
      console.error('Sign out error:', err)
      navigate('/login') // fallback
    }
  }

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Upload', path: '/upload' },
    { label: 'Roadmap', path: '/roadmap' },
    { label: 'Sessions', path: '/sessions' },
    { label: 'Simulation', path: '/simulation' },
  ]

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      height: '60px',
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      padding: '0 32px'
    }}>

      {/* Left — Logo */}
      <div
        onClick={() => navigate('/sessions')}
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: '700',
          fontSize: '18px',
          color: '#0f172a',
          cursor: 'pointer',
          justifySelf: 'start'
        }}
      >
        OnboardIQ+
      </div>

      {/* Center — Nav Links perfectly centered using grid */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        justifySelf: 'center'
      }}>
        {navLinks.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            style={({ isActive }) => ({
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              fontWeight: isActive ? '700' : '400',
              color: isActive ? '#0f172a' : '#64748b',
              textDecoration: 'none',
              padding: '6px 16px',
              borderRadius: '8px',
              background: isActive ? '#f1f5f9' : 'transparent',
              transition: 'all 200ms',
              whiteSpace: 'nowrap'
            })}
            className={({ isActive }) => isActive ? 'active-nav-link' : 'nav-link'}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains('active-nav-link')) {
                e.currentTarget.style.background = '#f8fafc';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.classList.contains('active-nav-link')) {
                e.currentTarget.style.background = 'transparent';
              }
            }}
          >
            {link.label}
          </NavLink>
        ))}
      </div>

      {/* Right — User Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        justifySelf: 'end'
      }}>
        <span style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '13px',
          color: '#64748b',
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {profile?.email || user?.email}
        </span>

        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#0f172a',
          display: 'grid',
          placeItems: 'center',
          color: '#ffffff',
          fontFamily: 'DM Sans, sans-serif',
          fontWeight: '600',
          fontSize: '14px',
          flexShrink: 0,
          cursor: 'pointer'
        }}>
          {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
        </div>

        <div style={{
          width: '1px',
          height: '20px',
          background: '#e2e8f0'
        }} />

        <button
          onClick={handleSignOut}
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
            color: '#64748b',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            transition: 'color 200ms',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}
