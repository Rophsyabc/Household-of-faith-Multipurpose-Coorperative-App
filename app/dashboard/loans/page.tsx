import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LoanForm } from './loan-form';
import { RepayButton } from './repay-button';
import { LoanCalculator } from './loan-calculator';
import { HandCoins, Clock, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { RealtimeLoans } from './realtime-loans';

export const dynamic = 'force-dynamic';

interface Loan {
    id: string;
    amount_requested: number;
    interest_rate: number;
    repayment_period_months: number;
    total_to_repay: number;
    amount_repaid: number;
    purpose: string;
    status: 'pending' | 'approved' | 'rejected' | 'repaid';
    created_at: string;
    admin_feedback?: string;
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: 'bg-orange-50 text-orange-600 border-orange-100',
        approved: 'bg-green-50 text-green-600 border-green-100',
        rejected: 'bg-red-50 text-red-600 border-red-100',
        repaid: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    };
    const style = styles[status] || 'bg-slate-50 text-slate-600';
    return (
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase ${style}`}>
            {status}
        </span>
    );
}

export default async function LoansPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single();
    const { data: loansData } = await supabase.from('loans').select('*').order('created_at', { ascending: false });

    const walletBalance = Number(wallet?.balance) || 0;
    const allLoans = (loansData as Loan[]) || [];
    
    let currentDebt = 0;
    for (let i = 0; i < allLoans.length; i++) {
        if (allLoans[i].status === 'approved') {
            currentDebt += (Number(allLoans[i].total_to_repay) - Number(allLoans[i].amount_repaid));
        }
    }

    return (
        <div className="space-y-10 pb-24">
            <RealtimeLoans userId={user.id} />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Cooperative Credit
                    </h1>
                    <p className="text-slate-500 font-medium">Manage your community-backed credit.</p>
                </div>
                {currentDebt > 0 && (
                    <div className="bg-red-50 px-6 py-4 rounded-[2rem] border border-red-100 flex items-center gap-4">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                        <div>
                            <p className="text-[10px] font-black text-red-400 uppercase">Liability</p>
                            <p className="text-xl font-black text-red-600">₦{currentDebt.toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-8">
                    <LoanCalculator />
                </div>

                <div className="lg:col-span-2 space-y-10">
                    <LoanForm walletBalance={walletBalance} />
                    <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden divide-y divide-slate-50">
                        {allLoans.length === 0 ? (
                            <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                                No history found
                            </div>
                        ) : (
                            allLoans.map((loan) => (
                                <div key={loan.id} className="p-8 hover:bg-slate-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-black text-slate-900">₦{Number(loan.amount_requested).toLocaleString()}</h3>
                                                <StatusBadge status={loan.status} />
                                            </div>
                                            <p className="text-sm text-slate-500 italic">&quot;{loan.purpose}&quot;</p>
                                        </div>
                                        {loan.status === 'approved' && (
                                            <RepayButton loanId={loan.id} remainingAmount={Number(loan.total_to_repay) - Number(loan.amount_repaid)} />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
