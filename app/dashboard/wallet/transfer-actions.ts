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

export async function transferFunds(targetEmail: string, amount: number) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    if (amount <= 0) return { error: 'Invalid amount' };

    // 1. Find target user
    const { data: targetProfile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('email', targetEmail.trim().toLowerCase())
        .single();

    if (!targetProfile) return { error: 'Recipient not found. Please check the email.' };
    if (targetProfile.id === user.id) return { error: 'You cannot send money to yourself.' };

    // 2. Check Sender Wallet
    const { data: myWallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
    if (!myWallet || Number(myWallet.balance) < amount) return { error: 'Insufficient funds.' };

    // 3. Process Transfer (RPC or manual - using manual for clarity)
    const { data: targetWallet } = await supabase.from('wallets').select('*').eq('user_id', targetProfile.id).single();
    if (!targetWallet) return { error: 'Recipient wallet error.' };

    // Deduct from me
    await supabase.from('wallets').update({ balance: Number(myWallet.balance) - amount }).eq('id', myWallet.id);
    
    // Credit target
    await supabase.from('wallets').update({ balance: Number(targetWallet.balance) + amount }).eq('id', targetWallet.id);

    // 4. Record Transactions
    await supabase.from('transactions').insert([
        { user_id: user.id, type: 'debit', amount, description: `Transfer to ${targetProfile.full_name}` },
        { user_id: targetProfile.id, type: 'credit', amount, description: `Transfer from ${user.email}` }
    ]);

    // 5. Notify Target
    await supabase.from('notifications').insert({
        user_id: targetProfile.id,
        message: `You received ₦${amount.toLocaleString()} from ${user.email}`,
        type: 'credit'
    });

    revalidatePath('/dashboard/wallet');
    return { success: true };
}
