'use server';

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js'; 
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const REGISTRATION_FEE = 5000;

// Standard Client
async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );
}

// Admin Client (Bypasses RLS for secure payouts)
function getAdminSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );
}

export async function createAjoGroup(formData: FormData) {
    const supabase = await getSupabase();
    const adminSupabase = getAdminSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: profile } = await supabase.from('profiles').select('kyc_status').eq('id', user.id).single();
    if (profile?.kyc_status !== 'verified') return { error: 'Complete KYC to create a group.' };

    const title = formData.get('title') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const frequency = formData.get('frequency') as string;
    const startDate = formData.get('start_date') as string;
    
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
    if (!wallet || Number(wallet.balance) < REGISTRATION_FEE) {
        return { error: `Insufficient balance for ₦${REGISTRATION_FEE.toLocaleString()} registration fee.` };
    }

    await supabase.from('wallets').update({ balance: Number(wallet.balance) - REGISTRATION_FEE }).eq('id', wallet.id);
    await adminSupabase.rpc('collect_registration_fee', { fee_amount: REGISTRATION_FEE });

    const isPrivate = formData.get('is_private') === 'on';
    const joinCode = isPrivate ? Math.random().toString(36).substring(2, 8).toUpperCase() : null;

    const { data: group, error: groupError } = await supabase
        .from('ajo_groups')
        .insert({ 
            creator_id: user.id, title, contribution_amount: amount, 
            frequency, start_date: startDate, is_private: isPrivate, 
            join_code: joinCode, late_fee_amount: 500    
        })
        .select().single();

    if (groupError) return { error: groupError.message };
    await supabase.from('ajo_members').insert({ group_id: group.id, user_id: user.id, position: 1 });

    revalidatePath('/dashboard/ajo');
    return { success: true };
}

export async function joinAjoGroup(groupId: string, code?: string) {
    const supabase = await getSupabase();
    const adminSupabase = getAdminSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: profile } = await supabase.from('profiles').select('kyc_status').eq('id', user.id).single();
    if (profile?.kyc_status !== 'verified') return { error: 'Verify identity to join.' };

    const { data: group } = await supabase.from('ajo_groups').select('*').eq('id', groupId).single();
    if (!group) return { error: 'Group not found' };

    if (group.is_private && (!code || code.trim().toUpperCase() !== group.join_code)) {
        return { error: 'Invalid join code.' };
    }

    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
    if (!wallet || Number(wallet.balance) < REGISTRATION_FEE) {
        return { error: 'Insufficient balance for registration fee.' };
    }

    await supabase.from('wallets').update({ balance: Number(wallet.balance) - REGISTRATION_FEE }).eq('id', wallet.id);
    await adminSupabase.rpc('collect_registration_fee', { fee_amount: REGISTRATION_FEE });

    const { count } = await supabase.from('ajo_members').select('*', { count: 'exact', head: true }).eq('group_id', groupId);
    const { error } = await supabase.from('ajo_members').insert({ group_id: groupId, user_id: user.id, position: (count || 0) + 1 });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/ajo');
    return { success: true };
}

export async function contributeToCycle(groupId: string, amount: number) {
    const supabase = await getSupabase();
    const adminSupabase = getAdminSupabase(); 
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: group } = await supabase.from('ajo_groups').select('*').eq('id', groupId).single();
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
    if (!group || !wallet) return { error: 'System sync error.' };

    if (Number(wallet.balance) < amount) return { error: 'Fund your wallet to contribute.' };

    // Update Wallet & Ledger
    await supabase.from('wallets').update({ balance: Number(wallet.balance) - amount }).eq('id', wallet.id);
    const currentCycle = group.current_cycle || 1;
    await supabase.from('ajo_ledger').insert({ group_id: groupId, user_id: user.id, cycle_number: currentCycle, amount, type: 'contribution' });

    // Check for Payout (Real-time check)
    const { count: cyclePaid } = await adminSupabase.from('ajo_ledger').select('*', { count: 'exact', head: true }).eq('group_id', groupId).eq('cycle_number', currentCycle).eq('type', 'contribution');
    const { count: totalMembers } = await adminSupabase.from('ajo_members').select('*', { count: 'exact', head: true }).eq('group_id', groupId);

    if (totalMembers && cyclePaid === totalMembers) {
        const winnerPos = ((currentCycle - 1) % totalMembers) + 1;
        const { data: winner } = await adminSupabase.from('ajo_members').select('user_id').eq('group_id', groupId).eq('position', winnerPos).single();
        if (winner) {
            const pot = amount * totalMembers;
            const { data: wWallet } = await adminSupabase.from('wallets').select('id, balance').eq('user_id', winner.user_id).single();
            if (wWallet) {
                await adminSupabase.from('wallets').update({ balance: Number(wWallet.balance) + pot }).eq('id', wWallet.id);
                await adminSupabase.from('transactions').insert({ user_id: winner.user_id, type: 'credit', amount: pot, description: `Ajo Pot: ${group.title} (Cycle ${currentCycle})` });
                await adminSupabase.from('notifications').insert({ user_id: winner.user_id, message: `₦${pot.toLocaleString()} Ajo Pot Received!`, type: 'ajo' });
            }
        }
        await adminSupabase.rpc('increment_cycle', { group_id_param: groupId });
    }

    revalidatePath(`/dashboard/ajo/${groupId}`);
    return { success: true };
}
