'use client';

import { Activity, Play, Users, Landmark, Zap, ShieldCheck } from 'lucide-react';
import { forceAdvanceCycle } from './actions';
import { useState } from 'react';
import { toast } from 'sonner';

interface Group {
    id: string;
    title: string;
    contribution_amount: number;
    current_cycle: number | null;
}

export function GroupsList({ groups }: { groups: Group[] | null }) {
    const [processing, setProcessing] = useState<string | null>(null);

    async function handleAdvance(groupId: string) {
        if (!confirm("Are you sure you want to FORCE advance this cycle? This will trigger payouts if contributions are met.")) return;
        
        setProcessing(groupId);
        const res = await forceAdvanceCycle(groupId);
        setProcessing(null);

        if (res?.error) toast.error(res.error);
        else toast.success("Cycle advanced successfully!");
    }

    return (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <Activity className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 leading-none">Ajo Group Management</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Lifecycle Control</p>
                    </div>
                </div>
                <span className="bg-cyan-100 text-cyan-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                    {groups?.length || 0} Active Communities
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/30 text-slate-400 border-b border-slate-100">
                        <tr>
                            <th className="p-4 font-black uppercase text-[10px] tracking-widest">Group Profile</th>
                            <th className="p-4 font-black uppercase text-[10px] tracking-widest text-center">Liquidity</th>
                            <th className="p-4 font-black uppercase text-[10px] tracking-widest text-center">Current Phase</th>
                            <th className="p-4 font-black uppercase text-[10px] tracking-widest text-right">System Override</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(!groups || groups.length === 0) ? (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-slate-400 italic">
                                    No active savings groups found in the system.
                                </td>
                            </tr>
                        ) : (
                            groups.map((group) => (
                                <tr key={group.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all">
                                                <Landmark className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900">{group.title}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {group.id.slice(0,8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-xl">
                                            <span className="text-[10px] font-black text-slate-400">₦</span>
                                            <span className="text-xs font-black text-slate-700">{group.contribution_amount.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-cyan-100">
                                                Cycle {group.current_cycle || 1}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => handleAdvance(group.id)}
                                            disabled={processing === group.id}
                                            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                                        >
                                            {processing === group.id ? (
                                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Play className="w-3 h-3 fill-current" />
                                            )}
                                            Advance Cycle
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-cyan-50/50 border-t border-slate-100 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-cyan-600" />
                <p className="text-[10px] text-cyan-800 font-bold leading-tight">
                    <span className="font-black uppercase">Admin Authority:</span> Advancing a cycle is an absolute action. It will verify all contributions and trigger the payout to the next member in the roster automatically.
                </p>
            </div>
        </div>
    );
}
