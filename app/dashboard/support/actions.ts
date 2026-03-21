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

export async function createTicket(formData: FormData) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;
    const priority = formData.get('priority') as string;

    const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        subject,
        message,
        priority: priority || 'normal'
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/support');
    return { success: true };
}

export async function closeTicket(ticketId: string) {
    const supabase = await getSupabase();
    await supabase.from('support_tickets').update({ status: 'closed' }).eq('id', ticketId);
    revalidatePath('/dashboard/support');
}
