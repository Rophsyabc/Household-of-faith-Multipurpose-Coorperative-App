'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const REFERRAL_BONUS_AMOUNT = 500;

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

export async function postAnnouncement(formData: FormData) {
    const supabase = await getSupabase();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const isPriority = formData.get('is_priority') === 'on';

    const { error } = await supabase.from('announcements').insert({ title, content, is_priority: isPriority });
    if (error) return { error: error.message };
    revalidatePath('/dashboard');
    return { success: true };
}

export async function processKyc(userId: string, status: 'verified' | 'failed') {
    const adminSupabase = getAdminSupabase();
    const { error } = await adminSupabase.from('profiles').update({ kyc_status: status }).eq('id', userId);
    
    if (error) return { error: error.message };

    if (status === 'verified') {
        const { data: profile } = await adminSupabase.from('profiles').select('referred_by').eq('id', userId).single();
        if (profile?.referred_by) {
            const { data: wallet } = await adminSupabase.from('wallets').select('id, balance').eq('user_id', profile.referred_by).single();
            if (wallet) {
                await adminSupabase.from('wallets').update({ balance: Number(wallet.balance) + REFERRAL_BONUS_AMOUNT }).eq('id', wallet.id);
                await adminSupabase.from('transactions').insert({ user_id: profile.referred_by, type: 'referral_bonus', amount: REFERRAL_BONUS_AMOUNT, description: 'Referral Bonus (KYC Verified)' });
            }
        }
    }

    revalidatePath('/dashboard/admin');
    return { success: true };
}

export async function processWithdrawal(requestId: string, status: 'approved' | 'rejected', feedback?: string) {
    const adminSupabase = getAdminSupabase();
    const { data: request } = await adminSupabase.from('withdrawal_requests').select('*').eq('id', requestId).single();
    if (!request || request.status !== 'pending') return { error: 'Invalid request' };

    if (status === 'rejected') {
        const { data: wallet } = await adminSupabase.from('wallets').select('id, balance').eq('user_id', request.user_id).single();
        if (wallet) {
            await adminSupabase.from('wallets').update({ balance: Number(wallet.balance) + Number(request.amount) }).eq('id', wallet.id);
        }
    }

    await adminSupabase.from('withdrawal_requests').update({ status, admin_feedback: feedback }).eq('id', requestId);
    revalidatePath('/dashboard/admin');
    return { success: true };
}
