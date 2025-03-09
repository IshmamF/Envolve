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
    const supabase = await createClient();
    let response;
    try {
        response = await supabase.from('posts').update({'upvotes': info.vote}).eq('id', info.post_id.toString)
        if (response.error) {
            console.error('error updating upvote or downvote, i dont know', response.error.message)
            return Promise.resolve({status: 500, message: "something went wrong with updating upvote/downvotes"});
        }
        return Promise.resolve({status: 200, message: "updated upvote/downvotes"});
    } catch (err) {
        console.error('error updating upvote or downvote, i dont know', err);
        return Promise.resolve({status: 500, message: "something went wrong with updating upvote/downvotes"});
    }
}

export async function downVoteUpdate(info: {vote: number, post_id: number}) {
    const supabase = await createClient();
    let response;
    try {
        response = await supabase.from('posts').update({'downvotes': info.vote}).eq('id', info.post_id.toString)
        if (response.error) {
            console.error('error updating upvote or downvote, i dont know', response.error.message)
            return Promise.resolve({status: 500, message: "something went wrong with updating upvote/downvotes"});
        }
        return Promise.resolve({status: 200, message: "updated upvote/downvotes"});
    } catch (err) {
        console.error('error updating upvote or downvote, i dont know', err);
        return Promise.resolve({status: 500, message: "something went wrong with updating upvote/downvotes"});
    }
}