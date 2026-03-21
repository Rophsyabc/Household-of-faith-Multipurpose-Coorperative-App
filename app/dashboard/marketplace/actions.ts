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

    let imageUrl = null;

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await adminSupabase.storage
            .from('marketplace-images')
            .upload(fileName, imageFile);

        if (uploadError) return { error: 'Image upload failed: ' + uploadError.message };
        
        const { data: { publicUrl } } = adminSupabase.storage.from('marketplace-images').getPublicUrl(fileName);
        imageUrl = publicUrl;
    }

    const { error } = await supabase.from('marketplace_items').insert({
        seller_id: user.id,
        title,
        description,
        price,
        category,
        image_url: imageUrl,
        status: 'active'
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/marketplace');
    return { success: true };
}

export async function markAsSold(itemId: string) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('marketplace_items')
        .update({ status: 'sold' })
        .eq('id', itemId)
        .eq('seller_id', user.id);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/marketplace');
    return { success: true };
}
