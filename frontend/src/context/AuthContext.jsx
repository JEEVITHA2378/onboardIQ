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
        const getSessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Supabase getSession timeout')), 5000)
        )
        
        const { data: { session }, error } = await Promise.race([getSessionPromise, timeoutPromise])

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
        console.error('Supabase init error:', err)
        // Ensure state is cleared aggressively on error
        localStorage.clear() 
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

  const signup = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      if (error) throw error;
      
      // Profile creation is typically handled via Supabase triggers,
      // but we can add a manual check or creation if needed.
      // For this app, let's assume a trigger handles it or we do it here.
      if (data.user) {
         await supabase.from('profiles').insert([
          { id: data.user.id, email: data.user.email, full_name: metadata.full_name }
        ]);
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
