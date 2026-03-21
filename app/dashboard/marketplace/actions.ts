'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );
}

function getAdminSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function listItem(formData: FormData) {
    const supabase = await getSupabase();
    const adminSupabase = getAdminSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const category = formData.get('category') as string;
    const imageFile = formData.get('image') as File;

    try {
        let imageUrl = null;
        if (imageFile && imageFile.size > 0) {
            const ext = imageFile.name.split('.').pop();
            const path = `${user.id}/${Date.now()}.${ext}`;
            const { error: uploadError } = await adminSupabase.storage
                .from('marketplace-images')
                .upload(path, imageFile);
            
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = adminSupabase.storage.from('marketplace-images').getPublicUrl(path);
            imageUrl = publicUrl;
        }

        const { error } = await supabase.from('marketplace_items').insert({
            seller_id: user.id,
            title,
            description,
            price,
            category,
            image_url: imageUrl
        });

        if (error) throw error;

        revalidatePath('/dashboard/marketplace');
        return { success: true };
    } catch (err: any) {
        return { error: err.message || 'Failed to list item' };
    }
}

export async function markAsSold(itemId: string) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
        .from('marketplace_items')
        .update({ status: 'sold' })
        .eq('id', itemId)
        .eq('seller_id', user?.id);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/marketplace');
    return { success: true };
}
