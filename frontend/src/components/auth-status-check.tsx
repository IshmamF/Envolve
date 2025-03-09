'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { usePathname, useRouter } from 'next/navigation';

interface AuthStatusCheckProps {
  children: React.ReactNode;
}

export function AuthStatusCheck({ children }: AuthStatusCheckProps) {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const publicPaths = ['/auth/signin', '/auth/signup', '/'];

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setStatus('authenticated');
      } else {
        setStatus('unauthenticated');
        
        // Only redirect if trying to access a protected route
        if (!publicPaths.includes(pathname) && !pathname.startsWith('/auth/')) {
          router.push('/auth/signin');
        }
      }
    };

    checkStatus();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('authenticated');
      } else if (event === 'SIGNED_OUT') {
        setStatus('unauthenticated');
        if (!publicPaths.includes(pathname) && !pathname.startsWith('/auth/')) {
          router.push('/auth/signin');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (status === 'loading') {
    return null; // Or a loading spinner
  }

  return children;
}
