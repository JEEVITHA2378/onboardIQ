import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { OnboardProvider } from './context/OnboardContext';

// Components
import { ProtectedRoute } from './components/ProtectedRoute';

// Screens
import Signup from './screens/Signup';
import Login from './screens/Login';
import Upload from './screens/Upload';
import Simulation from './screens/Simulation';
import Analysing from './screens/Analysing';
import Roadmap from './screens/Roadmap';
import Dashboard from './screens/Dashboard';
import Sessions from './screens/Sessions';

// Constants
import { ROUTES } from './constants/routes';

// Page Transition Wrapper
const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-10%', opacity: 0 }}
      transition={{ ease: "circOut", duration: 0.35 }}
      className="w-full min-h-screen bg-transparent absolute top-0 left-0"
    >
      {children}
    </motion.div>
  );
};

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [navigate])
  
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <AnimatePresence mode="popLayout" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
          <Route path={ROUTES.SIGNUP} element={<PageWrapper><Signup /></PageWrapper>} />
          <Route path={ROUTES.LOGIN} element={<PageWrapper><Login /></PageWrapper>} />

          {/* Protected Routes */}
          <Route path={ROUTES.UPLOAD} element={<ProtectedRoute><PageWrapper><Upload /></PageWrapper></ProtectedRoute>} />
          <Route path={ROUTES.SIMULATION} element={<ProtectedRoute><PageWrapper><Simulation /></PageWrapper></ProtectedRoute>} />
          <Route path={ROUTES.ANALYSING} element={<ProtectedRoute><PageWrapper><Analysing /></PageWrapper></ProtectedRoute>} />
          <Route path={ROUTES.ROADMAP} element={<ProtectedRoute><PageWrapper><Roadmap /></PageWrapper></ProtectedRoute>} />
          <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>} />
          <Route path={ROUTES.SESSIONS} element={<ProtectedRoute><PageWrapper><Sessions /></PageWrapper></ProtectedRoute>} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <OnboardProvider>
        <Router>
          <AnimatedRoutes />
        </Router>
      </OnboardProvider>
    </AuthProvider>
  );
}
