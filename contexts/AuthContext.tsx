import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { auth, getUserProfile } from '@/lib/supabase';
import { User } from '@/types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (session?.user) {
      const { data } = await getUserProfile(session.user.id);
      if (data) setUser(data);
    }
  };

  useEffect(() => {
    auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        getUserProfile(session.user.id).then(({ data }) => {
          if (data) setUser(data);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const { data } = await getUserProfile(session.user.id);
          if (data) setUser(data);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await auth.signUp({
      email,
      password,
    });
    
    // For demo mode, simulate successful signup
    if (data.user && !error) {
      // In demo mode, we'll simulate the user creation
      setUser({
        id: data.user.id,
        email,
        credits: 10, // Give demo users some credits
        subscription_plan: 'free',
        role: 'user',
        created_at: new Date().toISOString()
      });
      setSession({ user: data.user } as Session);
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await auth.signInWithPassword({
      email,
      password,
    });
    
    // For demo mode, simulate successful signin
    if (data.user && !error) {
      setUser({
        id: data.user.id,
        email,
        credits: 10, // Give demo users some credits
        subscription_plan: 'free',
        role: 'user',
        created_at: new Date().toISOString()
      });
      setSession({ user: data.user } as Session);
    }
    
    return { error };
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      loading,
      signUp,
      signIn,
      signOut,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}