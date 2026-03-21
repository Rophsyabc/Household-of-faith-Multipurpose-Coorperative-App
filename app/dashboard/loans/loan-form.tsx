'use client';

import { useState } from 'react';
import { applyForLoan } from './actions';
import { Loader2, Banknote, Calendar, UserPlus, Info } from 'lucide-react';
import { toast } from 'sonner';

export function LoanForm({ walletBalance }: { walletBalance: number }) {
    const [loading, setLoading] = useState(false);
    const maxLoan = walletBalance * 2;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        
        const res = await applyForLoan(formData);
        
        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Loan application submitted with guarantors!');
            (e.target as HTMLFormElement).reset();
        }
        setLoading(false);
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-cyan-600" />
                Apply for Loan
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Basic Loan Info */}
                <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loan Details</p>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Amount Requested (₦)
                        </label>
                        <div className="relative">
                            <input
                                name="amount"
                                type="number"
                                required
                                min="1000"
                                max={maxLoan}
                                placeholder="e.g. 50000"
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                            />
                            <span className="absolute right-3 top-2.5 text-[10px] font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded">
                                Max: ₦{maxLoan.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Period (Months)</label>
                            <select name="months" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none">
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Interest Rate</label>
                            <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 font-medium text-center">
                                5% Flat
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Purpose</label>
                        <textarea name="purpose" required rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none resize-none" placeholder="Business expansion, emergency, etc." />
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* 2. Guarantor 1 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-cyan-600" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Guarantor One</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input name="g1_name" required placeholder="Full Name" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                        <input name="g1_phone" required placeholder="Phone Number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                    </div>
                    <input name="g1_address" required placeholder="Residential Address" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                </div>

                {/* 3. Guarantor 2 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-cyan-600" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Guarantor Two</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input name="g2_name" required placeholder="Full Name" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                        <input name="g2_phone" required placeholder="Phone Number" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                    </div>
                    <input name="g2_address" required placeholder="Residential Address" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none" />
                </div>

                <div className="bg-amber-50 p-3 rounded-lg flex items-start gap-3 border border-amber-100">
                    <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800 leading-relaxed">
                        By submitting, you confirm that these guarantors have agreed to stand for you and may be contacted for verification.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading || walletBalance < 1000}
                    className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Loan Application"}
                </button>
            </form>
        </div>
    );
}
