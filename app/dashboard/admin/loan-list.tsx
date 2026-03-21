'use client';

import { useState } from 'react';
import { approveLoan, rejectLoan } from '../loans/actions';
import { Check, X, HandCoins, UserPlus, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Loan {
    id: string;
    user_id: string;
    amount_requested: number;
    interest_rate: number;
    repayment_period_months: number;
    purpose: string;
    status: 'pending' | 'approved' | 'rejected' | 'repaid';
    created_at: string;
    guarantor1_name: string;
    guarantor1_phone: string;
    guarantor1_address: string;
    guarantor2_name: string;
    guarantor2_phone: string;
    guarantor2_address: string;
    profiles?: {
        full_name: string;
    };
}

export function LoanList({ loans }: { loans: Loan[] | null }) {
    const [processing, setProcessing] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);

    async function handleApprove(id: string) {
        setProcessing(id);
        const res = await approveLoan(id);
        if (res?.error) toast.error(res.error);
        else toast.success('Loan approved and credited!');
        setProcessing(null);
    }

    async function handleReject(id: string) {
        const feedback = window.prompt('Enter reason for rejection:');
        if (feedback === null) return;
        
        setProcessing(id);
        const res = await rejectLoan(id, feedback);
        if (res?.error) toast.error(res.error);
        else toast.success('Loan application rejected.');
        setProcessing(null);
    }

    const pendingLoans = loans?.filter(l => l.status === 'pending') || [];

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HandCoins className="w-5 h-5 text-cyan-600" />
                    <h3 className="font-bold text-slate-900">Pending Loan Applications</h3>
                </div>
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingLoans.length} Pending
                </span>
            </div>

            {pendingLoans.length === 0 ? (
                <div className="p-10 text-center text-slate-500">
                    <p>No pending loan applications.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {pendingLoans.map((loan) => (
                        <div key={loan.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-slate-900 text-xl">
                                            ₦{loan.amount_requested.toLocaleString()}
                                        </p>
                                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium">
                                            {loan.profiles?.full_name}
                                        </span>
                                    </div>
                                    
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        <span className="font-bold text-slate-700">Purpose:</span> {loan.purpose}
                                    </p>

                                    <button 
                                        onClick={() => setExpanded(expanded === loan.id ? null : loan.id)}
                                        className="text-xs font-bold text-cyan-600 hover:underline cursor-pointer flex items-center gap-1"
                                    >
                                        <UserPlus className="w-3 h-3" />
                                        {expanded === loan.id ? 'Hide Guarantors' : 'View Two Guarantors'}
                                    </button>

                                    {expanded === loan.id && (
                                        <div className="grid md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2">
                                            {/* G1 */}
                                            <div className="p-3 bg-cyan-50/50 rounded-lg border border-cyan-100">
                                                <p className="text-[10px] font-bold text-cyan-700 uppercase mb-2">Guarantor 1</p>
                                                <p className="text-sm font-bold text-slate-900">{loan.guarantor1_name}</p>
                                                <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                                                    <Phone className="w-3 h-3" /> {loan.guarantor1_phone}
                                                </p>
                                                <p className="text-xs text-slate-600 flex items-start gap-1 mt-1">
                                                    <MapPin className="w-3 h-3 mt-0.5" /> {loan.guarantor1_address}
                                                </p>
                                            </div>
                                            {/* G2 */}
                                            <div className="p-3 bg-cyan-50/50 rounded-lg border border-cyan-100">
                                                <p className="text-[10px] font-bold text-cyan-700 uppercase mb-2">Guarantor 2</p>
                                                <p className="text-sm font-bold text-slate-900">{loan.guarantor2_name}</p>
                                                <p className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                                                    <Phone className="w-3 h-3" /> {loan.guarantor2_phone}
                                                </p>
                                                <p className="text-xs text-slate-600 flex items-start gap-1 mt-1">
                                                    <MapPin className="w-3 h-3 mt-0.5" /> {loan.guarantor2_address}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleReject(loan.id)}
                                        disabled={processing === loan.id}
                                        className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl border border-red-100 transition-colors cursor-pointer"
                                        title="Reject Loan"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleApprove(loan.id)}
                                        disabled={processing === loan.id}
                                        className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                                    >
                                        {processing === loan.id ? (
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Check className="w-5 h-5" />
                                        )}
                                        Approve Disbursement
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
