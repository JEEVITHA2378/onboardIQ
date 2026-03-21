import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          setUser(null)
          setProfile(null)
          setSession(null)
          setLoading(false)
          return
        }

        // Verify user exists in profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError || !profile) {
          // Account deleted — clear everything
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
          setSession(null)
          setLoading(false)
          return
        }

        setUser(session.user)
        setProfile(profile)
        setSession(session)

      } catch (err) {
        setUser(null)
        setProfile(null)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          setProfile(null)
          setSession(null)
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setProfile(profile)
          setSession(session)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Mock login for demo purposes
  const login = async (email, password) => {
    setUser({ id: '1', email });
    return { data: { user: { id: '1', email } }, error: null };
  };

  const signup = async (email, password) => {
    setUser({ id: '1', email });
    return { data: { user: { id: '1', email } }, error: null };
  };

  const logout = async () => {
    setUser(null);
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
