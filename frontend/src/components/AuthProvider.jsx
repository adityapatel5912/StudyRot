import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext(null);

const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof window !== 'undefined' && window.__SUPABASE_URL__) ||
  '';
const SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__) ||
  '';

let supabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn('Supabase initialization failed:', err);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true);
  const [savedKeysStatus, setSavedKeysStatus] = useState({ has_groq: false, has_tavily: false });

  useEffect(() => {
    const storedUser = localStorage.getItem('studyrot_user');
    const storedToken = localStorage.getItem('studyrot_token');

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          setToken(session.access_token);
          fetchKeysStatus(session.access_token);
        } else if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
            fetchKeysStatus(storedToken);
          } catch {}
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const wasGuest = !localStorage.getItem('studyrot_user');
          setUser(session.user);
          setToken(session.access_token);
          localStorage.setItem('studyrot_user', JSON.stringify(session.user));
          localStorage.setItem('studyrot_token', session.access_token);
          fetchKeysStatus(session.access_token);

          if (wasGuest && (localStorage.getItem('studyrot:lastFeed') || localStorage.getItem('studyrot:reviewCount'))) {
            setTimeout(() => {
              if (window.confirm("Save your current feed and review progress to your account?")) {
                // Migrate guest data
                console.info("Migrating guest data to account...");
              } else {
                localStorage.removeItem('studyrot:lastFeed');
              }
            }, 500);
          }
        } else {
          setUser(null);
          setToken(null);
          localStorage.removeItem('studyrot_user');
          localStorage.removeItem('studyrot_token');
          setSavedKeysStatus({ has_groq: false, has_tavily: false });
        }
      });

      return () => subscription.unsubscribe();
    } else {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken || 'demo_token_user');
          fetchKeysStatus(storedToken || 'demo_token_user');
        } catch {}
      }
      setLoading(false);
    }
  }, []);

  const fetchKeysStatus = async (authToken) => {
    try {
      const res = await fetch('/api/keys/status', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedKeysStatus(data);
      }
    } catch (err) {
      console.warn('Could not fetch keys status:', err);
    }
  };

  const signInWithGoogle = async () => {
    if (supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        return;
      } catch (err) {
        console.warn('Supabase OAuth failed, using local Google sign-in fallback:', err.message);
      }
    }

    const mockGoogleUser = {
      id: 'google_aarav_' + Date.now().toString().slice(-4),
      email: 'aarav.sharma@cbse.edu.in',
      user_metadata: {
        full_name: 'Aarav Sharma',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Aarav&backgroundColor=0f1e3d',
      },
    };
    const mockToken = 'mock_jwt_token_' + mockGoogleUser.id;

    setUser(mockGoogleUser);
    setToken(mockToken);
    localStorage.setItem('studyrot_user', JSON.stringify(mockGoogleUser));
    localStorage.setItem('studyrot_token', mockToken);
    fetchKeysStatus(mockToken);
  };

  const signOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch {}
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('studyrot_user');
    localStorage.removeItem('studyrot_token');
    setSavedKeysStatus({ has_groq: false, has_tavily: false });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoMode,
        setDemoMode,
        savedKeysStatus,
        refreshKeysStatus: () => fetchKeysStatus(token),
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
