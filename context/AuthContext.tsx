// context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  role: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // User or null
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Define fetchUserRole first to ensure it's available when called
    const fetchUserRole = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('Error fetching role:', error);
          setRole(null);
        } else {
          setRole(data.role);
          
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        setRole(null);
      }
    };

    const getSessionFromStorage = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error retrieving session:', error);
        }

        if (session) {
          console.log('Session from localStorage:', session);
          setUser(session.user);
          await fetchUserRole(session.user.id);
        } else {
          console.log('No session found in localStorage.');
          setUser(null);
          setRole(null);
        }
      } catch (error) {
        console.error('Error during session retrieval:', error);
        setUser(null);
        setRole(null);
      }
    };

    // Initialize authentication state
    getSessionFromStorage();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        console.log('Session updated from auth state change:', session.user.role);
        setUser(session.user);
        fetchUserRole(session.user.id);
      } else {
        console.log('Session cleared on auth state change');
        setUser(null);
        setRole(null);
      }
    });

    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Error during sign-in:', error);
        throw error;
      }
    } catch (error) {
      console.error('Sign-in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error during sign-out:', error);
        // Optionally, handle the error (e.g., show a notification)
      }
      setUser(null);
      setRole(null);
      router.push('/');
    } catch (error) {
      console.error('Sign-out failed:', error);
      // Optionally, handle the error
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
