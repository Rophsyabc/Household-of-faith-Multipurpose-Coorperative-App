'use client';

import { useState } from 'react';
import { repayLoan } from './actions';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from '@/app/components/Modal';

export function RepayButton({ loanId, remainingAmount }: { loanId: string, remainingAmount: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');

    async function handleRepay(e: React.FormEvent) {
        e.preventDefault();
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return toast.error("Enter a valid amount");

        setLoading(true);
        const res = await repayLoan(loanId, val);
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success("Repayment successful!");
            setIsOpen(false);
            setAmount('');
        }
    }

    return (
        <>
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
                <CreditCard className="w-3.5 h-3.5" />
                Make Repayment
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Loan Repayment">
                <form onSubmit={handleRepay} className="space-y-5">
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                            Amount to Repay (₦)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-3.5 font-bold text-slate-400">₦</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                max={remainingAmount}
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none text-slate-900 font-black text-xl"
                                autoFocus
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 font-medium">
                            Max remaining: ₦{remainingAmount.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                        <p className="text-xs text-cyan-800 leading-relaxed font-medium">
                            Funds will be deducted from your cooperative wallet instantly.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-black rounded-2xl shadow-xl shadow-cyan-100 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Repayment"}
                    </button>
                </form>
            </Modal>
        </>
    );
}
