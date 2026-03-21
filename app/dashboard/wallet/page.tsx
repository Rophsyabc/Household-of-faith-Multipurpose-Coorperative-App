export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { 
    History, 
    ShieldCheck, 
    Eye, 
    TrendingUp,
    Clock,
    ArrowLeftRight,
    Building2
} from 'lucide-react';
import { TransactionForm } from './transaction-form';
import { NotificationClearer } from './notification-clearer';
import { TransferForm } from './transfer-form';
import { RealtimeBalance } from '@/app/components/RealtimeBalance';
import { RealtimeTransactionList } from './realtime-transaction-list';
import { RealtimeWalletObserver } from './realtime-wallet-observer';
import Link from 'next/link';

interface Transaction {
    id: string;
    user_id: string;
    type: 'credit' | 'debit' | 'fee' | 'loan' | 'dividend' | 'referral_bonus' | 'repayment' | 'transfer_in' | 'transfer_out';
    amount: number;
    description: string;
    created_at: string;
}

interface WithdrawalRequest {
    id: string;
    amount: number;
    status: 'pending' | 'processing' | 'approved' | 'rejected';
    created_at: string;
    admin_feedback?: string;
    bank_accounts: {
        bank_name: string;
        account_number: string;
    } | null;
}

interface Wallet {
    id: string;
    balance: number;
}

export default async function WalletPage() {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const [
        { data: wallet },
        { data: rawTransactions },
        { data: rawWithdrawals },
        { data: bankAccounts }
    ] = await Promise.all([
        supabase.from('wallets').select('*').eq('user_id', user?.id).single<Wallet>(),
        supabase.from('transactions').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(15),
        supabase.from('withdrawal_requests').select('*, bank_accounts(bank_name, account_number)').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('bank_accounts').select('id, bank_name, account_number').eq('user_id', user?.id)
    ]);

    const transactions = rawTransactions as Transaction[] || [];
    const withdrawals = rawWithdrawals as WithdrawalRequest[] || [];

    return (
        <div className="space-y-10 pb-24">
            <NotificationClearer />
            <RealtimeWalletObserver userId={user?.id || ''} />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Center</h1>
                    <p className="text-slate-500 font-medium mt-1">Monitor your liquidity, transfers, and cashout status.</p>
                </div>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
                    <ShieldCheck className="w-4 h-4" /> Real-time Audited
                </div>
            </div>

            {/* Premium Balance Card */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl group-hover:bg-cyan-500/30 transition-all duration-700" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />

                <div className="relative z-10 space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-slate-300">
                                Treasury ID: #{user?.id.slice(0, 8).toUpperCase()}
                            </div>
                            <Eye className="w-5 h-5 text-slate-500 cursor-pointer hover:text-white transition-colors" />
                        </div>
                        <TrendingUp className="w-6 h-6 text-cyan-400 animate-pulse" />
                    </div>
                    
                    <div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2 ml-1">Total Available Credit</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-cyan-500">₦</span>
                            <RealtimeBalance 
                                initialBalance={wallet?.balance || 0} 
                                userId={user?.id || ''} 
                                className="text-6xl font-black tracking-tighter"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <TransactionForm 
                            type="credit" 
                            email={user?.email || ''} 
                            bankAccounts={bankAccounts || []}
                        />
                        <TransferForm />
                        <TransactionForm 
                            type="debit" 
                            email={user?.email || ''} 
                            bankAccounts={bankAccounts || []}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* TRANSACTIONS LIST */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
                            <History className="w-4 h-4 text-slate-400" /> Transaction Stream
                        </h2>
                        <button className="text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:underline">Full Analytics</button>
                    </div>

                    <RealtimeTransactionList initialTransactions={transactions} userId={user?.id || ''} />
                </div>

                {/* WITHDRAWAL HISTORY / STATUS */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="font-black text-slate-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" /> Cashout Tracker
                        </h2>
                        <Link href="/dashboard/profile" className="text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:underline">Link Bank</Link>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-50">
                        {(withdrawals.length === 0) ? (
                            <div className="py-24 text-center space-y-4">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                                    <Building2 className="w-10 h-10" />
                                </div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No withdrawal history</p>
                            </div>
                        ) : (
                            withdrawals.map((req) => (
                                <div key={req.id} className="p-6 hover:bg-slate-50/50 transition-all group">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
                                                req.status === 'approved' ? 'bg-green-50 text-green-600' :
                                                req.status === 'rejected' ? 'bg-red-50 text-red-600' :
                                                'bg-amber-50 text-amber-600'
                                            }`}>
                                                {req.status === 'approved' ? <ShieldCheck className="w-6 h-6" /> :
                                                 req.status === 'rejected' ? <XCircle className="w-6 h-6" /> :
                                                 <Clock className="w-6 h-6 animate-pulse" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-lg">₦{Number(req.amount).toLocaleString()}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{req.bank_accounts?.bank_name || 'Bank Account'}</p>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${
                                            req.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                            req.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                            'bg-amber-100 text-amber-700 border-amber-200'
                                        }`}>
                                            {req.status}
                                        </div>
                                    </div>
                                    
                                    {req.admin_feedback && (
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                                            <p className="text-[10px] text-slate-500 font-medium italic">"{req.admin_feedback}"</p>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">Ref: {req.id.slice(0, 12)}</p>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">{new Date(req.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Stats Card */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 mt-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Trust Level</span>
                                <span className="text-green-600">Premium</span>
                            </div>
                            <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[100%]" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Growth Multiplier</p>
                                    <p className="text-sm font-black text-slate-900">1.2x Savings Cap</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                    <ArrowLeftRight className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">Coop Transfers</p>
                                    <p className="text-sm font-black text-slate-900">Unlimited & Free</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getTxnStyle(txn: Transaction) {
    if (['credit', 'dividend', 'referral_bonus', 'transfer_in'].includes(txn.type)) return { bg: 'bg-green-50 text-green-600', icon: <ArrowDownLeft className="w-6 h-6" /> };
    if (txn.type === 'loan') return { bg: 'bg-cyan-50 text-cyan-600', icon: <ArrowLeftRight className="w-6 h-6" /> };
    if (txn.type === 'debit' || txn.type === 'transfer_out') return { bg: 'bg-slate-50 text-slate-600', icon: <ArrowUpRight className="w-6 h-6" /> };
    if (txn.type === 'repayment') return { bg: 'bg-purple-50 text-purple-600', icon: <Clock className="w-6 h-6" /> };
    if (txn.type === 'fee') return { bg: 'bg-orange-50 text-orange-600', icon: <AlertCircle className="w-6 h-6" /> };
    return { bg: 'bg-slate-50 text-slate-600', icon: <WalletIcon className="w-4 h-4" /> };
}
