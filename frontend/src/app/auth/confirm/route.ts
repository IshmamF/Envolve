import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'
  
  const cookieStore = cookies()
  
  if (token_hash && type) {
    const supabase = await createClient()
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      })
      
      if (!error) {
        // Redirect user to specified redirect URL or root of app
        return NextResponse.redirect(new URL(next, request.url))
      }
    } catch (error) {
      console.error('Error verifying OTP:', error)
    }
  }
  
  // Redirect the user to an error page with some instructions
  return NextResponse.redirect(new URL('/error', request.url))
}