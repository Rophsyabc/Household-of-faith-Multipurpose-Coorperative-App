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

async function verifyPaystackPayment(reference: string): Promise<any> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) throw new Error('Paystack secret key not configured');

    const url = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
        },
        next: { revalidate: 0 },
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Paystack verification failed: ${res.status} ${err}`);
    }

    const json = await res.json();
    if (json.status !== true) throw new Error(json.message || 'Paystack verification failed');
    return json.data;
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

        if (Number(wallet.balance) < amount) return { error: 'Insufficient funds for withdrawal.' };
        
        const { error: debitError } = await supabase
            .from('wallets')
            .update({ balance: Number(wallet.balance) - amount })
            .eq('id', wallet.id);

        if (debitError) return { error: 'Failed to hold funds for withdrawal.' };

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
            await supabase.from('wallets').update({ balance: Number(wallet.balance) }).eq('id', wallet.id);
            return { error: requestError.message };
        }
        
        await supabase.from('transactions').insert({
            user_id: user.id,
            type: 'transfer_out',
            amount: amount,
            description: 'Cash Withdrawal Request (Funds Held)',
        });

        revalidatePath('/dashboard/wallet');
        return { success: true, message: 'Withdrawal request submitted. Funds held for disbursement.' };
    } else {
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

export async function verifyPaystackAndCredit(reference: string): Promise<{ error?: string; success?: boolean }> {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    if (!reference) return { error: 'Missing reference' };

    // Idempotency: check if already processed
    const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('reference', reference)
        .maybeSingle();

    if (existing) return { success: true };

    // Verify with Paystack API
    const data = await verifyPaystackPayment(reference);
    if (data.status !== 'success') return { error: 'Payment not successful' };

    const email = data.customer?.email;
    if (email && email !== user.email) return { error: 'Email mismatch' };

    const amountNaira = Number(data.amount) / 100;

    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
    if (!wallet) return { error: 'Wallet not found' };

    const newBalance = Number(wallet.balance) + amountNaira;
    const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', wallet.id);

    if (updateError) return { error: 'Wallet update failed' };

    await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'credit',
        amount: amountNaira,
        description: `Paystack Deposit (${reference})`,
        reference: reference,
        status: 'completed',
    });

    revalidatePath('/dashboard/wallet');
    return { success: true };
}
