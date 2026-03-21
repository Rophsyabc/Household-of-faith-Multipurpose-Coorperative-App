'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

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

export async function createSavingsGoal(formData: FormData) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const title = formData.get('title') as string;
    const targetAmount = parseFloat(formData.get('target_amount') as string);
    const category = formData.get('category') as string;
    const frequency = formData.get('frequency') as string;
    const amountPerPeriod = parseFloat(formData.get('amount_per_period') as string) || 0;
    const deadline = formData.get('deadline') as string;
    const isLocked = formData.get('is_locked') === 'on';

    const { error } = await supabase.from('savings_goals').insert({
        user_id: user.id,
        title,
        target_amount: targetAmount,
        category: category || 'General',
        contribution_frequency: frequency || 'Manual',
        amount_per_period: amountPerPeriod,
        deadline: deadline || null,
        is_locked: isLocked,
        early_withdrawal_penalty: isLocked ? 5.0 : 0, // Increased to 5% for better discipline
        status: 'active'
    });

    if (error) return { error: error.message };
    revalidatePath('/dashboard/savings');
    return { success: true };
}

export async function addFundsToGoal(goalId: string, amount: number) {
    const supabase = await getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // 1. Check Wallet
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
    if (!wallet || Number(wallet.balance) < amount) return { error: 'Insufficient wallet balance.' };

    // 2. Get Goal
    const { data: goal } = await supabase.from('savings_goals').select('*').eq('id', goalId).single();
    if (!goal) return { error: 'Goal not found' };

    // 3. Deduct from Wallet
    const { error: walletError } = await supabase.from('wallets').update({ balance: Number(wallet.balance) - amount }).eq('id', wallet.id);
    if (walletError) return { error: 'Failed to deduct funds.' };

    // 4. Update Streak Logic
    let newStreak = Number(goal.streak_count || 0);
    const lastContrib = goal.last_contribution_at ? new Date(goal.last_contribution_at) : null;
    const now = new Date();

    if (lastContrib) {
        const diffInDays = Math.floor((now.getTime() - lastContrib.getTime()) / (1000 * 3600 * 24));
        if (diffInDays <= 1) {
            newStreak += 1;
        } else if (diffInDays > 1) {
            newStreak = 1; // Reset if missed a day (or based on frequency logic)
        }
    } else {
        newStreak = 1;
    }

    // 5. Update Goal
    const newAmount = (Number(goal.current_amount) || 0) + amount;
    const isCompleted = newAmount >= Number(goal.target_amount);

    await supabase.from('savings_goals').update({ 
        current_amount: newAmount,
        streak_count: newStreak,
        last_contribution_at: now.toISOString(),
        status: isCompleted ? 'completed' : 'active'
    }).eq('id', goalId);

    // 6. Record Transaction
    await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'debit',
        amount: amount,
        description: `Goal Credit: ${goal.title} (Streak: ${newStreak})`
    });

    revalidatePath('/dashboard/savings');
    return { success: true };
}

export async function withdrawFromGoal(goalId: string) {
    const supabase = await getSupabase();
    const adminSupabase = getAdminSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { data: goal } = await supabase.from('savings_goals').select('*').eq('id', goalId).single();
    if (!goal || goal.current_amount <= 0) return { error: 'No funds to withdraw.' };

    let withdrawalAmount = Number(goal.current_amount);
    let penalty = 0;

    if (goal.is_locked) {
        const now = new Date();
        const deadline = goal.deadline ? new Date(goal.deadline) : null;
        const goalReached = Number(goal.current_amount) >= Number(goal.target_amount);

        if (!goalReached && (!deadline || now < deadline)) {
            penalty = (withdrawalAmount * Number(goal.early_withdrawal_penalty || 0)) / 100;
            withdrawalAmount -= penalty;
        }
    }

    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
    await supabase.from('wallets').update({ balance: Number(wallet.balance) + withdrawalAmount }).eq('id', wallet.id);

    if (penalty > 0) {
        await adminSupabase.rpc('collect_late_fine', { fine_amount: penalty });
        await adminSupabase.from('transactions').insert({
            user_id: user.id,
            type: 'fee',
            amount: penalty,
            description: `Lock-break penalty: ${goal.title}`
        });
    }

    await supabase.from('savings_goals').update({ 
        current_amount: 0, 
        status: 'withdrawn',
        streak_count: 0,
        updated_at: new Date().toISOString()
    }).eq('id', goalId);

    await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'credit',
        amount: withdrawalAmount,
        description: `Goal Withdrawal: ${goal.title}`
    });

    revalidatePath('/dashboard/savings');
    revalidatePath('/dashboard/wallet');
    return { success: true };
}
