'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
    ArrowUpRight, 
    ArrowDownLeft, 
    Wallet as WalletIcon,
    Banknote,
    Clock,
    AlertCircle,
    Plus
} from 'lucide-react';

interface Transaction {
    id: string;
    user_id: string;
    type: 'credit' | 'debit' | 'fee' | 'loan' | 'dividend' | 'referral_bonus' | 'repayment' | 'transfer_in' | 'transfer_out';
    amount: number;
    description: string;
    created_at: string;
}

export function RealtimeTransactionList({ initialTransactions, userId }: { initialTransactions: Transaction[], userId: string }) {
    const [transactions, setTransactions] = useState(initialTransactions);

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const channel = supabase
            .channel(`wallet-txns-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'transactions',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    fetchTransactions();
                }
            )
            .subscribe();

        async function fetchTransactions() {
            const { data } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(15);
            
            if (data) setTransactions(data as Transaction[]);
        }

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-50">
            {transactions.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                        <WalletIcon className="w-10 h-10" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No transaction history yet.</p>
                </div>
            ) : (
                transactions.map((txn) => (
                    <div key={txn.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer group">
                        <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-slate-100 ${
                                getTxnStyle(txn).bg
                            }`}>
                                {getTxnStyle(txn).icon}
                            </div>

                            <div>
                                <p className="font-black text-slate-900 text-sm tracking-tight">{txn.description}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {new Date(txn.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} • {new Date(txn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={`font-black text-lg tracking-tighter ${
                                ['credit', 'loan', 'dividend', 'referral_bonus', 'transfer_in'].includes(txn.type) ? 'text-green-600' : 'text-slate-900'
                            }`}>
                                {['credit', 'loan', 'dividend', 'referral_bonus', 'transfer_in'].includes(txn.type) ? '+' : '-'}₦{Number(txn.amount).toLocaleString()}
                            </p>
                            <div className="flex items-center justify-end gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <p className="text-[9px] font-black uppercase text-slate-300 tracking-tighter">Settled</p>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

function getTxnStyle(txn: Transaction) {
    if (['credit', 'dividend', 'referral_bonus', 'transfer_in'].includes(txn.type)) return { bg: 'bg-green-50 text-green-600', icon: <ArrowDownLeft className="w-6 h-6" /> };
    if (txn.type === 'loan') return { bg: 'bg-cyan-50 text-cyan-600', icon: <Banknote className="w-6 h-6" /> };
    if (txn.type === 'debit' || txn.type === 'transfer_out') return { bg: 'bg-slate-50 text-slate-600', icon: <ArrowUpRight className="w-6 h-6" /> };
    if (txn.type === 'repayment') return { bg: 'bg-purple-50 text-purple-600', icon: <Clock className="w-6 h-6" /> };
    if (txn.type === 'fee') return { bg: 'bg-orange-50 text-orange-600', icon: <AlertCircle className="w-6 h-6" /> };
    return { bg: 'bg-slate-50 text-slate-600', icon: <PlusIcon className="w-4 h-4" /> };
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>
        </svg>
    );
}
