'use client';

import { useState } from 'react';
import { processWithdrawal } from './actions';
import { Banknote, Check, X, Clock, User, AlertCircle, Landmark } from 'lucide-react';
import { toast } from 'sonner';

interface WithdrawalRequest {
    id: string;
    user_id: string;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    profiles: {
        full_name: string;
        phone: string;
    };
    bank_accounts: {
        bank_name: string;
        account_number: string;
        account_name: string;
    };
}

export function WithdrawalList({ requests }: { requests: any[] | null }) {
    const [processing, setProcessing] = useState<string | null>(null);

    async function handleAction(id: string, status: 'approved' | 'rejected') {
        let feedback = '';
        if (status === 'rejected') {
            const reason = window.prompt('Enter reason for rejection:');
            if (reason === null) return;
            feedback = reason;
        }

        setProcessing(id);
        const res = await processWithdrawal(id, status, feedback);
        setProcessing(null);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success(`Withdrawal ${status} successfully.`);
        }
    }

    const pendingRequests = (requests || []).filter(r => r.status === 'pending') as WithdrawalRequest[];

    return (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden mt-8">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-2xl text-purple-600 shadow-sm">
                        <Banknote className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 text-lg">Cash Withdrawal Queue</h3>
                        <p className="text-xs text-slate-500 font-medium">Verify and settle member payout requests.</p>
                    </div>
                </div>
                <span className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-purple-100">
                    {pendingRequests.length} Pending
                </span>
            </div>

            {pendingRequests.length === 0 ? (
                <div className="p-20 text-center text-slate-400 flex flex-col items-center">
                    <Check className="w-16 h-16 mb-4 opacity-10" />
                    <p className="font-black uppercase tracking-[0.2em] text-[10px]">Treasury Synchronized</p>
                    <p className="text-sm font-medium mt-1">No pending withdrawal requests found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                            <tr>
                                <th className="p-6 font-black uppercase text-[10px] tracking-[0.2em]">Member & Identity</th>
                                <th className="p-6 font-black uppercase text-[10px] tracking-[0.2em]">Settlement Details</th>
                                <th className="p-6 font-black uppercase text-[10px] tracking-[0.2em]">Amount</th>
                                <th className="p-6 font-black uppercase text-[10px] tracking-[0.2em] text-right">Liquidity Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {pendingRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-slate-50/30 transition-all group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 font-black shadow-inner">
                                                {req.profiles?.full_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900">{req.profiles?.full_name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5">{req.profiles?.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-start gap-3">
                                            <Landmark className="w-4 h-4 text-cyan-500 mt-0.5" />
                                            <div>
                                                <p className="text-xs font-black text-slate-700">{req.bank_accounts?.bank_name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 tracking-tighter mt-0.5">
                                                    {req.bank_accounts?.account_number} • {req.bank_accounts?.account_name}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="font-black text-slate-900 text-lg tracking-tight">₦{Number(req.amount).toLocaleString()}</p>
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center justify-end gap-3">
                                            <button 
                                                onClick={() => handleAction(req.id, 'rejected')}
                                                disabled={!!processing}
                                                className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all disabled:opacity-50"
                                                title="Decline"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                            <button 
                                                onClick={() => handleAction(req.id, 'approved')}
                                                disabled={!!processing}
                                                className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                            >
                                                {processing === req.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                Settle Payout
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="p-6 bg-amber-50 border-t border-amber-100 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-[10px] text-amber-900 font-black uppercase tracking-widest">Protocol Warning</p>
                    <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                        Approval confirms that you have manually transferred ₦{pendingRequests.reduce((a, b) => a + Number(b.amount), 0).toLocaleString()} to members' bank accounts. Held wallet funds will be permanently cleared from the cooperative ledger.
                    </p>
                </div>
            </div>
        </div>
    );
}
