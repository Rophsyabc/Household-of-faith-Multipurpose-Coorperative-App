import { TrendingUp } from 'lucide-react';

interface PayoutCardProps {
    beneficiaryName: string;
    totalPot: number;
}

export function PayoutCard({ beneficiaryName, totalPot }: PayoutCardProps) {
    return (
        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-4">Current Payout</h3>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-lg font-bold">{beneficiaryName}</p>
                    <p className="text-slate-400 text-sm">Receives Pot: ₦{totalPot.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}