'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  // hi
  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const profData = {
    fN: formData.get('firstname') as string,
    lN: formData.get('lastname') as string,
  }

  // sign up user
  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  const userID = authData.user?.id

  {/* WHEN WE HAVE PROFILE TABLE, DO BELOW INSERT*/}

  /*

  const { error: profileError } = await supabase
  .from('profile')
  .insert([
    {
      id: userID,
      first_name: profData.fN,
      last_name: profData.lN,
    }
  ])

  if (profileError) {
    console.error('Profile Creation error:', profileError)
  }
    */

  revalidatePath('/', 'layout')
  redirect('/')
}