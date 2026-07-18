'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth-store';
import AuthGate from '../components/common/AuthGate';
import AIChatbot from '../components/common/AIChatbot';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 1000 * 60 * 5, // 5 minutes stale time
          },
        },
      })
  );

  const initializeAuth = useAuthStore((state) => state.initialize);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initializeAuth();
    setMounted(true);
  }, [initializeAuth]);

  if (!mounted) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-[#0C0C0E]">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-250 border-t-[#FF385C] animate-spin" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {isAuthenticated ? (
        <>
          {children}
          <AIChatbot />
        </>
      ) : (
        <AuthGate />
      )}
    </QueryClientProvider>
  );
}
