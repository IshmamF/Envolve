{/* literally just making to see if middleware works, can delete later if you
guys want */}

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import MapBoxWrapper from './_components/mapboxWrapper'
import { getPosts } from '@/lib/supabase/post';

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/signin')
  }

  const posts = await getPosts();

  return (
    <>
      <p>Hello {data.user.email}</p>
      <MapBoxWrapper/>
    </>

  )

}