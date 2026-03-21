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

// Admin Client for bypassing RLS
function getAdminSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

// --- 1. Post Announcement ---
export async function postAnnouncement(formData: FormData) {
    const supabase = await getSupabase();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const isPriority = formData.get('is_priority') === 'on';

    const { error } = await supabase.from('announcements').insert({
        title,
        content,
        is_priority: isPriority
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin');
    return { success: true };
}

// --- 2. Distribute Dividends ---
export async function distributeDividends(percentage: number) {
    const supabase = await getSupabase();
    const adminSupabase = getAdminSupabase();
    
    const { data: treasury } = await supabase.from('cooperative_treasury').select('*').eq(1).single();
    if (!treasury || treasury.total_fees_collected <= 0) return { error: 'No funds in treasury to distribute.' };

    const totalToDistribute = (Number(treasury.total_fees_collected) * percentage) / 100;

    const { data: members } = await supabase.from('profiles').select('id').eq('kyc_status', 'verified');
    if (!members || members.length === 0) return { error: 'No verified members to receive dividends.' };

    const amountPerMember = totalToDistribute / members.length;

    for (const member of members) {
        const { data: wallet } = await adminSupabase.from('wallets').select('id, balance').eq('user_id', member.id).single();
        if (wallet) {
            await adminSupabase.from('wallets').update({ balance: Number(wallet.balance) + amountPerMember }).eq('id', wallet.id);
            await adminSupabase.from('transactions').insert({
                user_id: member.id,
                type: 'dividend',
                amount: amountPerMember,
                description: `Dividend Distribution (${percentage}%)`
            });
            await adminSupabase.from('notifications').insert({
                user_id: member.id,
                message: `You received ₦${amountPerMember.toLocaleString()} as dividends from the cooperative!`,
                type: 'credit'
            });
        }
    }

    await adminSupabase.from('cooperative_treasury').update({
        total_fees_collected: Number(treasury.total_fees_collected) - totalToDistribute
    }).eq('id', 1);

    await adminSupabase.from('dividend_payouts').insert({
        total_distributed: totalToDistribute,
        percentage_of_treasury: percentage
    });

    revalidatePath('/dashboard/admin');
    return { success: true };
}

// --- 3. Toggle KYC Status ---
export async function toggleKyc(userId: string, currentStatus: string) {
    const adminSupabase = getAdminSupabase();
    const newStatus = currentStatus === 'verified' ? 'unverified' : 'verified';

    const { error } = await adminSupabase.from('profiles').update({ kyc_status: newStatus }).eq('id', userId);
    if (error) return { error: error.message };

    if (newStatus === 'verified') {
        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('referred_by, kyc_status')
            .eq('id', userId)
            .single();

        if (profile?.referred_by) {
            const { data: referrerWallet } = await adminSupabase
                .from('wallets').select('id, balance').eq('user_id', profile.referred_by).single();

            if (referrerWallet) {
                await adminSupabase.from('wallets')
                    .update({ balance: Number(referrerWallet.balance) + REFERRAL_BONUS_AMOUNT })
                    .eq('id', referrerWallet.id);

                await adminSupabase.from('transactions').insert({
                    user_id: profile.referred_by,
                    type: 'referral_bonus',
                    amount: REFERRAL_BONUS_AMOUNT,
                    description: `Bonus for referring a new verified member.`
                });

                await adminSupabase.from('notifications').insert({
                    user_id: profile.referred_by,
                    message: `Congratulations! You earned ₦${REFERRAL_BONUS_AMOUNT.toLocaleString()} because a member you referred completed their KYC.`,
                    type: 'credit'
                });
            }
        }
    }

    revalidatePath('/dashboard/admin');
    return { success: true };
}

// --- 4. Advance Cycle ---
export async function forceAdvanceCycle(groupId: string) {
    const adminSupabase = getAdminSupabase();
    const { data: group } = await adminSupabase.from('ajo_groups').select('*').eq('id', groupId).single();
    if (!group) return { error: 'Group not found' };
    const currentCycle = group.current_cycle || 1;
    const { count: totalMembers } = await adminSupabase.from('ajo_members').select('*', { count: 'exact', head: true }).eq('group_id', groupId);
    const members = totalMembers || 0;
    
    if (members === 0) return { error: "Cannot advance a group with no members." };

    const activePosition = ((currentCycle - 1) % members) + 1;
    const { data: winnerMember } = await adminSupabase.from('ajo_members').select('user_id').eq('group_id', groupId).eq('position', activePosition).single();
    
    if (!winnerMember) return { error: `No member found at Position ${activePosition}.` };
    
    const payoutAmount = Number(group.contribution_amount) * members;
    const { data: wallet } = await adminSupabase.from('wallets').select('id, balance').eq('user_id', winnerMember.user_id).single();
    
    if (wallet) {
        await adminSupabase.from('wallets').update({ balance: Number(wallet.balance) + payoutAmount }).eq('id', wallet.id);
        await adminSupabase.from('transactions').insert({ 
            user_id: winnerMember.user_id, 
            type: 'credit', 
            amount: payoutAmount, 
            description: `Ajo Payout - Cycle ${currentCycle}` 
        });
        await adminSupabase.from('ajo_ledger').insert({ 
            group_id: groupId, 
            user_id: winnerMember.user_id, 
            amount: payoutAmount, 
            type: 'payout', 
            cycle_number: currentCycle 
        });
        await adminSupabase.from('notifications').insert({
            user_id: winnerMember.user_id,
            message: `Congratulations! You received a payout of ₦${payoutAmount.toLocaleString()} for Ajo Cycle ${currentCycle}.`,
            type: 'credit'
        });
    }
    
    await adminSupabase.rpc('increment_cycle', { group_id_param: groupId });
    revalidatePath('/dashboard/admin');
    revalidatePath(`/dashboard/ajo/${groupId}`);
    return { success: true };
}

// --- 5. Withdrawal Requests Management ---
export async function processWithdrawal(requestId: string, status: 'approved' | 'rejected', feedback?: string) {
    const adminSupabase = getAdminSupabase();
    const { data: request } = await adminSupabase.from('withdrawal_requests').select('*').eq('id', requestId).single();
    if (!request || request.status !== 'pending') return { error: 'Request not found or already processed.' };

    if (status === 'approved') {
        await adminSupabase.from('notifications').insert({
            user_id: request.user_id,
            message: `Your withdrawal of ₦${Number(request.amount).toLocaleString()} has been approved and disbursed.`,
            type: 'info'
        });
    } else {
        const { data: wallet } = await adminSupabase.from('wallets').select('id, balance').eq('user_id', request.user_id).single();
        if (wallet) {
            await adminSupabase.from('wallets').update({ 
                balance: Number(wallet.balance) + Number(request.amount) 
            }).eq('id', wallet.id);

            await adminSupabase.from('transactions').insert({
                user_id: request.user_id,
                type: 'credit',
                amount: request.amount,
                description: `Refund: Rejected Withdrawal Request`
            });
        }

        await adminSupabase.from('notifications').insert({
            user_id: request.user_id,
            message: `Your withdrawal request of ₦${Number(request.amount).toLocaleString()} was rejected. Reason: ${feedback || 'Cooperative policy.'}`,
            type: 'info'
        });
    }

    const { error: updateError } = await adminSupabase.from('withdrawal_requests').update({ 
        status, 
        admin_feedback: feedback,
        updated_at: new Date().toISOString()
    }).eq('id', requestId);

    if (updateError) return { error: updateError.message };

    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/wallet');
    return { success: true };
}

// --- 6. Support Tickets Management ---
export async function updateTicketStatus(ticketId: string, status: string) {
    const adminSupabase = getAdminSupabase();
    const { error } = await adminSupabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

    if (error) return { error: error.message };
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/support');
    return { success: true };
}

export async function replyToTicket(ticketId: string, reply: string) {
    const adminSupabase = getAdminSupabase();
    const { error } = await adminSupabase
        .from('support_tickets')
        .update({ 
            admin_reply: reply, 
            status: 'resolved',
            updated_at: new Date().toISOString() 
        })
        .eq('id', ticketId);

    if (error) return { error: error.message };

    const { data: ticket } = await adminSupabase.from('support_tickets').select('user_id, subject').eq('id', ticketId).single();
    if (ticket) {
        await adminSupabase.from('notifications').insert({
            user_id: ticket.user_id,
            message: `Admin replied to your ticket: ${ticket.subject}`,
            type: 'info'
        });
    }

    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/support');
    return { success: true };
}
