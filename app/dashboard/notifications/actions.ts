'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );
}

export async function markAsRead(notificationId: string) {
    const supabase = await getSupabase();
    await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    revalidatePath('/dashboard');
}

export async function markAllAsRead() {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    }
    revalidatePath('/dashboard');
}
