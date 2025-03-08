"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // The route.ts handler will handle the actual verification
    // This page is just for showing a loading state
    
    // If there are no search params, redirect to home
    if (!searchParams.get('token_hash') || !searchParams.get('type')) {
      router.push('/');
    }
  }, [searchParams, router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-md w-full mx-auto rounded-lg p-8 shadow-input bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-center">
        <h1 className="text-2xl font-bold mb-4">Verifying your account</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please wait while we confirm your email...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    </div>
  );
} 