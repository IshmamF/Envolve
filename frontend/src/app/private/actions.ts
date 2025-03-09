'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSurroundingData () {
    const supabase = await createClient();

    const response = await supabase
    .from('posts')
    .select('*');
    
    if (response.error) {
        console.error(response.error.message)
        return []
    };
    
    
    return Promise.resolve(response.data)
}

export async function upVoteUpdate(info: {vote: number, post_id: number}) {
    console.log(`Attempting to update upvotes for post ${info.post_id} to ${info.vote}`);
    const supabase = await createClient();
    let response;
    try {
        // Convert post_id to number if it's a string to ensure type consistency
        const postId = typeof info.post_id === 'string' ? parseInt(info.post_id) : info.post_id;
        
        response = await supabase
          .from('posts')
          .update({'upvotes': info.vote})
          .eq('id', postId);
          
        if (response.error) {
            console.error('Error updating upvote:', response.error.message);
            return Promise.resolve({status: 500, message: "something went wrong with updating upvote/downvotes"});
        }
        
        // Check if any rows were affected
        if (response.count === 0) {
            console.warn(`No rows updated for post ID ${postId}`);
        } else {
            console.log(`Successfully updated upvotes for post ${postId} to ${info.vote}`);
        }
        
        return Promise.resolve({status: 200, message: "updated upvote/downvotes"});
    } catch (err) {
        console.error('Error updating upvote:', err);
        return Promise.resolve({status: 500, message: "something went wrong with updating upvote/downvotes"});
    }
}

export async function downVoteUpdate(info: {vote: number, post_id: number}) {
    console.log(`Attempting to update downvotes for post ${info.post_id} to ${info.vote}`);
    const supabase = await createClient();
    let response;
    try {
        // Convert post_id to number if it's a string to ensure type consistency
        const postId = typeof info.post_id === 'string' ? parseInt(info.post_id) : info.post_id;
        
        response = await supabase
          .from('posts')
          .update({'downvotes': info.vote})
          .eq('id', postId);
          
        if (response.error) {
            console.error('Error updating downvote:', response.error.message);
            return Promise.resolve({status: 500, message: "something went wrong with updating upvote/downvotes"});
        }
        
        // Check if any rows were affected
        if (response.count === 0) {
            console.warn(`No rows updated for post ID ${postId}`);
        } else {
            console.log(`Successfully updated downvotes for post ${postId} to ${info.vote}`);
        }
        
        return Promise.resolve({status: 200, message: "updated upvote/downvotes"});
    } catch (err) {
        console.error('Error updating downvote:', err);
        return Promise.resolve({status: 500, message: "something went wrong with updating upvote/downvotes"});
    }
}