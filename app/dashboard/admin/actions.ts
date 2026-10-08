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

async function verifyAdmin(supabase: any): Promise<{ isAdmin: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { isAdmin: false, error: 'Unauthorized' };

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    const adminEmailEnv = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    // If NEXT_PUBLIC_ADMIN_EMAIL is configured, require email match as a second factor.
    // If env var is absent, rely on DB is_admin flag only to prevent lockout.
    const passesEmailCheck = !adminEmailEnv
        || user.email?.toLowerCase() === adminEmailEnv.toLowerCase();

    return { isAdmin: profile?.is_admin === true && passesEmailCheck };
}

export async function postAnnouncement(formData: FormData) {
    const supabase = await getSupabase();
    const { isAdmin, error: adminError } = await verifyAdmin(supabase);
    if (!isAdmin) return { error: adminError || 'Admin access required' };

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const isPriority = formData.get('is_priority') === 'on';

    const { error } = await supabase.from('announcements').insert({ title, content, is_priority: isPriority });
    if (error) return { error: error.message };
    revalidatePath('/dashboard');
    return { success: true };
}

export async function processKyc(userId: string, status: 'verified' | 'failed') {
    const supabase = await getSupabase();
    const adminSupabase = getAdminSupabase();

    const { isAdmin, error: adminError } = await verifyAdmin(supabase);
    if (!isAdmin) return { error: adminError || 'Admin access required' };

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
    const supabase = await getSupabase();
    const { isAdmin, error: adminError } = await verifyAdmin(supabase);
    if (!isAdmin) return { error: adminError || 'Admin access required' };

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

export async function distributeDividends(percentage: number) {
    const supabase = await getSupabase();
    const { isAdmin, error: adminError } = await verifyAdmin(supabase);
    if (!isAdmin) return { error: adminError || 'Admin access required' };

    const adminSupabase = getAdminSupabase();
    const { data: treasury } = await adminSupabase.from('cooperative_treasury').select('total_fees_collected').eq('id', 1).single();
    const pool = Number(treasury?.total_fees_collected || 0) * (percentage / 100);
    const { data: members } = await adminSupabase.from('profiles').select('id').eq('kyc_status', 'verified');
    if (!members || members.length === 0) return { error: 'No verified members found' };
    const share = Math.floor(pool / members.length);
    for (const member of members) {
        const { data: wallet } = await adminSupabase.from('wallets').select('id, balance').eq('user_id', member.id).single();
        if (wallet) {
            await adminSupabase.from('wallets').update({ balance: Number(wallet.balance) + share }).eq('id', wallet.id);
            await adminSupabase.from('transactions').insert({ user_id: member.id, type: 'dividend', amount: share, description: `Dividend (${percentage}%)` });
        }
    }
    revalidatePath('/dashboard/admin');
    return { success: true };
}

export async function forceAdvanceCycle(groupId: string) {
    const supabase = await getSupabase();
    const { isAdmin, error: adminError } = await verifyAdmin(supabase);
    if (!isAdmin) return { error: adminError || 'Admin access required' };

    const adminSupabase = getAdminSupabase();
    const { data: group } = await adminSupabase.from('ajo_groups').select('*').eq('id', groupId).single();
    if (!group) return { error: 'Group not found' };
    const currentCycle = group.current_cycle || 1;
    const { data: winner } = await adminSupabase.from('ajo_members').select('user_id').eq('group_id', groupId).eq('position', ((currentCycle - 1) % 10) + 1).single();
    if (winner) {
        const pot = Number(group.contribution_amount) * 10;
        const { data: wWallet } = await adminSupabase.from('wallets').select('id, balance').eq('user_id', winner.user_id).single();
        if (wWallet) {
            await adminSupabase.from('wallets').update({ balance: Number(wWallet.balance) + pot }).eq('id', wWallet.id);
            await adminSupabase.from('transactions').insert({ user_id: winner.user_id, type: 'credit', amount: pot, description: `Ajo Pot: ${group.title} (Cycle ${currentCycle})` });
        }
    }
    await adminSupabase.rpc('increment_cycle', { group_id_param: groupId });
    revalidatePath('/dashboard/admin');
    return { success: true };
}

export async function replyToTicket(ticketId: string, reply: string) {
    const supabase = await getSupabase();
    const { isAdmin, error: adminError } = await verifyAdmin(supabase);
    if (!isAdmin) return { error: adminError || 'Admin access required' };
    const { error } = await supabase.from('support_tickets').update({ admin_reply: reply }).eq('id', ticketId);
    if (error) return { error: error.message };
    revalidatePath('/dashboard/admin');
    return { success: true };
}

export async function updateTicketStatus(ticketId: string, status: string) {
    const supabase = await getSupabase();
    const { isAdmin, error: adminError } = await verifyAdmin(supabase);
    if (!isAdmin) return { error: adminError || 'Admin access required' };
    const { error } = await supabase.from('support_tickets').update({ status }).eq('id', ticketId);
    if (error) return { error: error.message };
    revalidatePath('/dashboard/admin');
    return { success: true };
}
