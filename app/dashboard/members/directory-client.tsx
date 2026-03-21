'use client';

import { useState } from 'react';
import { Search, Mail, ShieldCheck, Star, MessageSquare, Send, Users } from 'lucide-react';
import Link from 'next/link';

interface Member {
    id: string;
    full_name: string;
    email: string;
    kyc_status: string;
    occupation: string | null;
}

export function DirectoryClient({ members }: { members: Member[] }) {
    const [search, setSearch] = useState('');

    const filteredMembers = members.filter(m => 
        m.full_name.toLowerCase().includes(search.toLowerCase()) || 
        m.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Community Directory
                        <span className="bg-cyan-100 text-cyan-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                            {members.length} Members
                        </span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Connect with verified cooperative members for transfers and networking.</p>
                </div>
                
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or email..." 
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem]">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No matching members found</p>
                    </div>
                ) : (
                    filteredMembers.map((member) => (
                        <div key={member.id} className="bg-white border border-slate-200 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-cyan-100 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Users className="w-20 h-20" />
                            </div>
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform">
                                        {member.full_name?.[0] || 'U'}
                                    </div>
                                    {member.kyc_status === 'verified' ? (
                                        <div className="bg-green-50 text-green-600 p-2 rounded-xl border border-green-100 shadow-sm" title="Verified Member">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 text-slate-300 p-2 rounded-xl border border-slate-100" title="Pending Verification">
                                            <Star className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h3 className="font-black text-slate-900 text-lg tracking-tight group-hover:text-cyan-600 transition-colors">{member.full_name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{member.occupation || 'Cooperative Member'}</p>
                                </div>

                                <div className="mt-auto space-y-4">
                                    <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-all">
                                        <Mail className="w-4 h-4 text-slate-400 group-hover:text-cyan-600" />
                                        <span className="text-xs font-bold text-slate-600 truncate">{member.email}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link 
                                            href={`/dashboard/wallet?transfer=${member.email}`}
                                            className="flex-1 bg-slate-900 hover:bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                                        >
                                            <Send className="w-3.5 h-3.5" /> Transfer
                                        </Link>
                                        <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-cyan-600 hover:border-cyan-200 transition-all shadow-sm">
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
