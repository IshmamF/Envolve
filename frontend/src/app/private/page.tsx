{/* literally just making to see if middleware works, can delete later if you
guys want */}

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import MapBoxWrapper from './_components/mapboxWrapper'

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/signin')
  }

  return (
    <>
      <p>Hello {data.user.email}</p>
      <MapBoxWrapper/>
    </>

  )

}