'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: User | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data: User | null;
  }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: null, data: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Function to refresh the auth state
  const refreshAuthState = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error refreshing auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial check for the user
    refreshAuthState();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error, data: null };
      }
      
      if (data?.user) {
        setUser(data.user); // Immediately update the user state
        await refreshAuthState(); // Force a refresh of the auth state
        router.push('/');
        router.refresh(); // Force refresh the current route
        return { error: null, data: data.user };
      }
      
      return { error: new Error('No user returned after sign in'), data: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as Error, data: null };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        return { error, data: null };
      }
      
      if (data?.user) {
        setUser(data.user);
        await refreshAuthState();
        router.push('/');
        router.refresh();
        return { error: null, data: data.user };
      }
      
      return { error: new Error('No user returned after sign up'), data: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as Error, data: null };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      router.push('/auth/signin');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}