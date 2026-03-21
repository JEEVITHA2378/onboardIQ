import React, { Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { OnboardProvider } from './context/OnboardContext'
import ProtectedRoute from './components/ProtectedRoute'

// Screens
import Signup from './screens/Signup'
import Login from './screens/Login'
import Upload from './screens/Upload'
import Simulation from './screens/Simulation'
import Analysing from './screens/Analysing'
import Roadmap from './screens/Roadmap'
import Dashboard from './screens/Dashboard'
import Sessions from './screens/Sessions'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          gap: '16px',
          padding: '32px'
        }}>
          <h1 style={{ fontSize: '24px', color: '#0f172a' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {this.state.error?.message}
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Go to Login
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <OnboardProvider>
            <Routes>
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/upload" element={
                <ProtectedRoute><Upload /></ProtectedRoute>
              } />
              <Route path="/simulation" element={
                <ProtectedRoute><Simulation /></ProtectedRoute>
              } />
              <Route path="/analysing" element={
                <ProtectedRoute><Analysing /></ProtectedRoute>
              } />
              <Route path="/roadmap" element={
                <ProtectedRoute><Roadmap /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/sessions" element={
                <ProtectedRoute><Sessions /></ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </OnboardProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
