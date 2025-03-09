import { createClient } from '@/lib/supabase/client';
import { Post } from '@/types/Post';

// Get all posts from the database
export async function getPosts(): Promise<Post[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching posts:', error.message);
    return [];
  }
  
  return data || [];
}

/**
 * Sets up a real-time subscription for post status changes
 */
export const subscribeToPostStatusChanges = (onStatusChange: (post: Post) => void) => {
  const supabase = createClient();
  
  // Subscribe to changes on the posts table where status becomes true
  const subscription = supabase
    .channel('public:posts')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'posts',
        filter: 'status=eq.true'
      },
      (payload) => {
        // The payload.new will contain the updated post
        console.log('Post status changed:', payload.new);
        onStatusChange(payload.new as Post);
      }
    )
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    supabase.removeChannel(subscription);
  };
};

/**
 * Manually check if a post status has changed
 * Useful for immediate UI updates after voting
 */
export const checkPostStatus = async (postId: string | number): Promise<boolean> => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('posts')
    .select('status')
    .eq('id', postId)
    .single();
  
  if (error) {
    console.error('Error checking post status:', error.message);
    return false;
  }
  
  return data?.status || false;
}; 