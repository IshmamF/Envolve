'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSurroundingData () {
    const supabase = await createClient();

    const response = await supabase
                    .from('posts')
                    .select();

    if (response.error) {
        console.error(response.error.message)
        return []
    };
    
    return Promise.resolve(response.data)
}