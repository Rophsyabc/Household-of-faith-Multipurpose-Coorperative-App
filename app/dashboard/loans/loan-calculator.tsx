'use client';

import { useState } from 'react';
import { Calculator, Info, Zap } from 'lucide-react';

export function LoanCalculator() {
    const [amount, setAmount] = useState(50000);
    const [months, setMonths] = useState(3);
    
    const interestRate = 0.05; // 5%
    const totalRepayment = amount * (1 + interestRate);
    const monthlyInstallment = totalRepayment / months;

    return (
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                <Calculator className="w-24 h-24" />
            </div>
            
            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-500 rounded-xl">
                        <Zap className="w-4 h-4 text-white fill-current" />
                    </div>
                    <h3 className="text-lg font-black tracking-tight">Quick Calculator</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Loan Amount (₦)</label>
                        <input 
                            type="range" min="10000" max="1000000" step="10000"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between mt-2 font-black text-cyan-400">
                            <span>₦{amount.toLocaleString()}</span>
                            <span className="text-slate-500 text-[10px]">Max ₦1M</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Duration ({months} Months)</label>
                        <div className="flex gap-2">
                            {[3, 6, 12].map(m => (
                                <button 
                                    key={m}
                                    onClick={() => setMonths(m)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                                        months === m ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-400'
                                    }`}
                                >
                                    {m}M
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Repayment</span>
                        <span className="text-xl font-black text-white">₦{monthlyInstallment.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Total + 5% Interest</span>
                        <span className="text-sm font-black text-green-400">₦{totalRepayment.toLocaleString()}</span>
                    </div>
                </div>

                <div className="bg-white/5 p-3 rounded-2xl flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
                        Actual eligibility depends on your membership tier and savings-to-loan ratio.
                    </p>
                </div>
            </div>
        </div>
    );
}
