'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Transaction {
    id: string;
    amount: number;
    type: 'credit' | 'debit' | 'fee' | 'loan' | 'dividend' | 'referral_bonus' | 'repayment' | 'transfer_in' | 'transfer_out';
    description: string;
    created_at: string;
}

export function RealtimeLedger({ initialTransactions, userId }: { initialTransactions: Transaction[], userId: string }) {
    const [transactions, setTransactions] = useState(initialTransactions);

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const channel = supabase
            .channel(`ledger-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'transactions',
                    filter: `user_id=eq.${userId}`,
                },
                () => {
                    fetchLatest();
                }
            )
            .subscribe();

        async function fetchLatest() {
            const { data } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);
            
            if (data) setTransactions(data as Transaction[]);
        }

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Real-time Ledger</h3>
                <Link href="/dashboard/wallet" className="text-[10px] font-black text-cyan-600 uppercase tracking-widest hover:underline">Full Statement</Link>
            </div>
            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden divide-y divide-slate-50">
                {transactions.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center">
                        <AlertCircle className="w-10 h-10 text-slate-100 mb-2" />
                        <p className="text-sm text-slate-400 font-medium italic">Your financial history starts here.</p>
                    </div>
                ) : (
                    transactions.map((tx) => (
                        <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${
                                    ['credit', 'dividend', 'referral_bonus', 'loan', 'transfer_in'].includes(tx.type)
                                    ? 'bg-green-50 text-green-600' 
                                    : 'bg-slate-50 text-slate-400'
                                }`}>
                                    {['credit', 'dividend', 'referral_bonus', 'transfer_in'].includes(tx.type) ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-black text-slate-900 text-sm tracking-tight">{tx.description || 'Cooperative Entry'}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                        {new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <span className={`font-black text-sm ${
                                ['credit', 'dividend', 'referral_bonus', 'loan', 'transfer_in'].includes(tx.type) ? 'text-green-600' : 'text-slate-900'
                            }`}>
                                {['credit', 'dividend', 'referral_bonus', 'loan', 'transfer_in'].includes(tx.type) ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
