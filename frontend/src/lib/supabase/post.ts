import { createClient } from './client';
import { Post } from '@/types/Post';

export async function getPosts(): Promise<Post[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
  
  return data || [];
} 