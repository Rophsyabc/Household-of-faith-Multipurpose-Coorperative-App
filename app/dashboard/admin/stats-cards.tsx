import { AlertCircle, Users, Activity, BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';

interface StatsCardsProps {
    pendingCount: number;
    activeGroupCount: number;
    totalVolume: number;
}

export function StatsCards({ pendingCount, activeGroupCount, totalVolume }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Risk/Verification Control */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-all">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Verifications</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{pendingCount}</p>
                    <p className="text-[10px] text-orange-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> High Priority Review
                    </p>
                </div>
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-7 h-7" />
                </div>
            </div>

            {/* 2. Operational Dynamics */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-cyan-200 transition-all">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Ajo Groups</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">{activeGroupCount}</p>
                    <p className="text-[10px] text-cyan-600 font-bold flex items-center gap-1">
                        <Activity className="w-3 h-3" /> Community Velocity
                    </p>
                </div>
                <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7" />
                </div>
            </div>

            {/* 3. Financial Liquidity */}
            <div className="bg-slate-900 p-6 rounded-2xl shadow-xl flex items-center justify-between group">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Total Transaction Volume</p>
                    <p className="text-3xl font-black text-white tracking-tighter">₦{totalVolume.toLocaleString()}</p>
                    <p className="text-[10px] text-cyan-500 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Net Economic Impact
                    </p>
                </div>
                <div className="w-14 h-14 bg-slate-800 text-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl border border-white/5 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-7 h-7" />
                </div>
            </div>
        </div>
    );
}
