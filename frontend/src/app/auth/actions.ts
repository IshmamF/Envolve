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
    first_name: formData.get('firstname') as string,
    last_name: formData.get('lastname') as string,
  }

  // sign up user
  const { data: authData, error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  const userID = authData.user?.id

  // Create user profile in user_profiles table
  if (userID) {
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          user: userID,
          first_name: profData.first_name,
          last_name: profData.last_name,
        }
      ])

    if (profileError) {
      console.error('Profile Creation error:', profileError)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

// Function to update user profile
export async function updateProfile(userId: string, profileData: { first_name?: string; last_name?: string }) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('user_profiles')
    .update(profileData)
    .eq('user', userId)
  
  if (error) {
    console.error('Profile Update error:', error)
    return { success: false, error }
  }
  
  return { success: true }
}

// Function to get user profile
export async function getProfile(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user', userId)
    .single()
  
  if (error) {
    console.error('Get Profile error:', error)
    return { profile: null, error }
  }
  
  return { profile: data, error: null }
}