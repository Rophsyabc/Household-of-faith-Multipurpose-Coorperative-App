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

export async function processTransaction(amount: number, type: 'credit' | 'debit', bankAccountId?: string) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
    if (!wallet) return { error: 'Wallet not found' };
    if (amount <= 0) return { error: 'Amount must be positive' };
    
    if (type === 'debit') {
        if (!bankAccountId) return { error: 'Please select a bank account for withdrawal.' };

        // 1. Verify liquidity
        if (Number(wallet.balance) < amount) return { error: 'Insufficient funds for withdrawal.' };
        
        // 2. Deduct funds immediately (Holding state)
        const { error: debitError } = await supabase
            .from('wallets')
            .update({ balance: Number(wallet.balance) - amount })
            .eq('id', wallet.id);

        if (debitError) return { error: 'Failed to hold funds for withdrawal.' };

        // 3. Create the request
        const { error: requestError } = await supabase
            .from('withdrawal_requests')
            .insert({
                user_id: user.id,
                amount: amount,
                bank_account_id: bankAccountId,
                status: 'pending',
                reference: `WDR-${Date.now()}-${Math.floor(Math.random() * 1000)}`
            });

        if (requestError) {
            // Refund if request creation fails
            await supabase.from('wallets').update({ balance: Number(wallet.balance) }).eq('id', wallet.id);
            return { error: requestError.message };
        }
        
        // 4. Log the debit transaction
        await supabase.from('transactions').insert({
            user_id: user.id,
            type: 'transfer_out',
            amount: amount,
            description: 'Cash Withdrawal Request (Funds Held)',
        });

        revalidatePath('/dashboard/wallet');
        return { success: true, message: 'Withdrawal request submitted. Funds held for disbursement.' };
    } else {
        // --- DEPOSIT LOGIC (Mock or Paystack reference validation) ---
        const newBalance = Number(wallet.balance) + amount;
        const { error: updateError } = await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);
        if (updateError) return { error: updateError.message };

        await supabase.from('transactions').insert({
            user_id: user.id,
            type: 'credit',
            amount: amount,
            description: 'Wallet Deposit',
        });

        revalidatePath('/dashboard/wallet');
        return { success: true };
    }
}
