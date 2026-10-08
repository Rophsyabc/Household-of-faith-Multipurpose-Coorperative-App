'use client';

import { ShieldCheck, Landmark } from 'lucide-react';

export function MemberCard({ name, status, id }: { name: string, status: string, id: string }) {
    return (
        <div className="relative w-full max-w-sm aspect-[1.586/1] mx-auto group perspective-1000">
            <div className="w-full h-full bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500 group-hover:shadow-cyan-500/20 ring-1 ring-white/10">
                {/* Decorative Patterns */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-24 -mb-24 blur-3xl" />
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '24px 24px' }} />

                <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                                <Landmark className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-black text-xs tracking-tight uppercase">Household of Faith</span>
                        </div>
                        {status === 'verified' && (
                            <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30 backdrop-blur-md">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Member Portfolio</p>
                        <h3 className="text-xl font-black tracking-tight truncate uppercase">{name}</h3>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Internal ID</p>
                            <p className="text-xs font-mono font-bold text-cyan-400">ID-{id.slice(0, 12).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <div className="w-10 h-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center backdrop-blur-sm">
                                <div className="w-6 h-6 border-2 border-cyan-500/50 rounded-md rotate-45" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
