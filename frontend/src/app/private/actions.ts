'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSurroundingData () {
    const supabase = await createClient();

    const response = await supabase
                    .from('posts')
                    .select('title, description, image_url, longitude, latitude, severity, id, upvotes, downvotes, resolved, location, category, tags');

    if (response.error) {
        console.error(response.error.message)
        return []
    };
    
    return Promise.resolve(response.data)
}