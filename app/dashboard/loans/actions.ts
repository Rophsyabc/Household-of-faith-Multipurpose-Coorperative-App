'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Standard Client
async function getSupabase() {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );
}

// Admin Client
function getAdminSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );
}

export async function applyForLoan(formData: FormData) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const amountRequested = parseFloat(formData.get('amount') as string);
    const months = parseInt(formData.get('months') as string);
    const purpose = formData.get('purpose') as string;
    
    // Guarantor Details
    const g1Name = formData.get('g1_name') as string;
    const g1Phone = formData.get('g1_phone') as string;
    const g1Address = formData.get('g1_address') as string;

    const g2Name = formData.get('g2_name') as string;
    const g2Phone = formData.get('g2_phone') as string;
    const g2Address = formData.get('g2_address') as string;

    // 1. Validation: Check KYC
    const { data: profile } = await supabase.from('profiles').select('kyc_status').eq('id', user.id).single();
    if (profile?.kyc_status !== 'verified') return { error: 'Complete KYC to apply for loans.' };

    // 2. Validation: Check Savings
    const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single();
    const maxLoan = (Number(wallet?.balance) || 0) * 2;
    
    if (amountRequested > maxLoan) {
        return { error: `Loan limit exceeded. You can only borrow up to ₦${maxLoan.toLocaleString()} (2x your savings).` };
    }

    const interestRate = 5.0;
    const totalToRepay = amountRequested * (1 + interestRate / 100);

    // 3. Submit Application
    const { error } = await supabase.from('loans').insert({
        user_id: user.id,
        amount_requested: amountRequested,
        repayment_period_months: months,
        total_to_repay: totalToRepay,
        purpose: purpose,
        interest_rate: interestRate,
        guarantor1_name: g1Name,
        guarantor1_phone: g1Phone,
        guarantor1_address: g1Address,
        guarantor2_name: g2Name,
        guarantor2_phone: g2Phone,
        guarantor2_address: g2Address
    });

    if (error) return { error: error.message };

    revalidatePath('/dashboard/loans');
    return { success: true };
}

export async function repayLoan(loanId: string, amount: number) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // 1. Get Loan and Wallet
    const { data: loan } = await supabase.from('loans').select('*').eq('id', loanId).eq('user_id', user.id).single();
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();

    if (!loan || !wallet) return { error: 'Data not found' };
    if (Number(wallet.balance) < amount) return { error: 'Insufficient wallet balance' };

    const remainingToRepay = Number(loan.total_to_repay) - Number(loan.amount_repaid);
    const paymentAmount = Math.min(amount, remainingToRepay);

    // 2. Deduct from wallet
    const { error: walletError } = await supabase.from('wallets').update({ balance: Number(wallet.balance) - paymentAmount }).eq('id', wallet.id);
    if (walletError) return { error: 'Payment failed' };

    // 3. Update loan
    const newRepaidAmount = Number(loan.amount_repaid) + paymentAmount;
    const isRepaid = newRepaidAmount >= Number(loan.total_to_repay);

    const { error: loanError } = await supabase.from('loans').update({ 
        amount_repaid: newRepaidAmount,
        status: isRepaid ? 'repaid' : 'approved'
    }).eq('id', loanId);

    if (loanError) return { error: 'Failed to update loan status' };

    // 4. Record transaction (Type: 'repayment')
    await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'repayment',
        amount: paymentAmount,
        description: `Loan Repayment for: ${loan.purpose}`
    });

    revalidatePath('/dashboard/loans');
    revalidatePath('/dashboard/wallet');
    return { success: true };
}

export async function approveLoan(loanId: string) {
    const adminSupabase = getAdminSupabase();
    const { data: loan } = await adminSupabase.from('loans').select('*').eq('id', loanId).single();
    if (!loan || loan.status !== 'pending') return { error: 'Loan not found or already processed.' };
    
    const { error: updateError } = await adminSupabase.from('loans').update({ status: 'approved' }).eq('id', loanId);
    if (updateError) return { error: updateError.message };
    
    const { data: wallet } = await adminSupabase.from('wallets').select('id, balance').eq('user_id', loan.user_id).single();
    if (wallet) {
        await adminSupabase.from('wallets').update({ balance: Number(wallet.balance) + Number(loan.amount_requested) }).eq('id', wallet.id);
        
        // Log transaction (Type: 'loan')
        await adminSupabase.from('transactions').insert({ 
            user_id: loan.user_id, 
            type: 'loan', 
            amount: loan.amount_requested, 
            description: `Loan Disbursement: ${loan.purpose || 'Cooperative Loan'}` 
        });
        
        await adminSupabase.from('notifications').insert({ 
            user_id: loan.user_id, 
            message: `Your loan of ₦${Number(loan.amount_requested).toLocaleString()} has been approved and credited to your wallet.`, 
            type: 'credit' 
        });
    }
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/loans');
    return { success: true };
}

export async function rejectLoan(loanId: string, feedback: string) {
    const adminSupabase = getAdminSupabase();
    const { error } = await adminSupabase.from('loans').update({ status: 'rejected', admin_feedback: feedback }).eq('id', loanId);
    if (error) return { error: error.message };
    revalidatePath('/dashboard/admin');
    revalidatePath('/dashboard/loans');
    return { success: true };
}
