'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        const next = searchParams.get('next') ?? '/'

        const supabase = createClient()

        // still attempt verification but don't check the result
        if (token_hash && type) {
          await supabase.auth.verifyOtp({
            type: type as any,
            token_hash,
          })
        }

        // always redirect after a short delay
        setTimeout(() => {
          router.push(next)
        }, 2000)
      } catch (error) {
        console.error('Confirmation error:', error)
        // Still redirect even if there's an error
        router.push('/')
      }
    }

    handleRedirect()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="max-w-md w-full mx-auto rounded-lg p-8 shadow-input bg-white dark:bg-black">
        <h1 className="text-2xl font-bold text-center mb-4 text-green-600">Approving User</h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Please wait while we redirect you...
        </p>
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      </div>
    </div>
  )
}