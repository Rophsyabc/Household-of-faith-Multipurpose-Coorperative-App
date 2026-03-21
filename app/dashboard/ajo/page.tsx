import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Users, Calendar, Banknote, ArrowRight, CheckCircle2, Lock, } from 'lucide-react';
import { CreateGroupForm } from './create-group-form';
import { JoinButton } from './join-button'; 
import { RealtimeGroups } from './realtime-groups';


interface AjoGroup {
    id: string;
    title: string;
    contribution_amount: number;
    frequency: string;
    start_date: string;
    creator_id: string;      
    is_private: boolean;     
    join_code: string | null; 
}

export default async function AjoPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // --- Fetch All Groups
    const { data: rawGroups } = await supabase
        .from('ajo_groups')
        .select('*')
        .order('created_at', { ascending: false });
    
    const groups = (rawGroups || []) as AjoGroup[];

    // --- Fetch My Memberships
    const { data: myMemberships } = await supabase
        .from('ajo_members')
        .select('group_id')
        .eq('user_id', user?.id);

    const joinedGroupIds = new Set(myMemberships?.map((m) => m.group_id));

    return (
        <div className="space-y-10 pb-24">
            <RealtimeGroups />
            
            <div className="space-y-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cooperative Savings</h1>
                    <p className="text-slate-500 font-medium mt-1">Join a trusted rotation or start your own cooperative savings circle.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <CreateGroupForm />
                    </div>

                    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                            <Users className="w-24 h-24" />
                        </div>
                        <h3 className="font-black text-lg mb-6 flex items-center gap-2 relative z-10 text-cyan-400">
                            <CheckCircle2 className="w-5 h-5" />
                            How it Works
                        </h3>

                        <ul className="space-y-5 text-sm relative z-10">
                            <li className="flex gap-4">
                                <span className="bg-white/10 w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs border border-white/10 shrink-0">1</span>
                                <span className="text-slate-300 font-medium">Create a group (Public or Private) and set the amount.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="bg-white/10 w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs border border-white/10 shrink-0">2</span>
                                <span className="text-slate-300 font-medium">Invite members using the Group ID or Secret Code.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="bg-white/10 w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs border border-white/10 shrink-0">3</span>
                                <span className="text-slate-300 font-medium">Members are shuffled into a payout order.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="bg-white/10 w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs border border-white/10 shrink-0">4</span>
                                <span className="text-slate-300 font-medium">Everyone pays regularly; one person takes the pot.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* SECTION 2: Available Groups Grid */}
            <div className="space-y-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Live Rotations</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                            <Users className="w-16 h-16 text-slate-100 mx-auto mb-4" />
                            <h3 className="text-slate-900 font-black">No active groups</h3>
                            <p className="text-slate-400 text-sm font-medium">Be the first to create one above!</p>
                        </div>
                    ) : (
                        groups.map((group) => {
                            const isMember = joinedGroupIds.has(group.id);
                            const isCreator = group.creator_id === user?.id;
                            const amount = Number(group.contribution_amount);

                            return (
                                <div key={group.id} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:border-cyan-100 transition-all flex flex-col h-full relative group overflow-hidden">
                                    {isCreator && group.is_private && (
                                        <div className="absolute top-6 right-6 z-10 bg-amber-50 text-amber-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                            Code: {group.join_code}
                                        </div>
                                    )}

                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                                            group.is_private ? 'bg-purple-50 text-purple-600' : 'bg-cyan-50 text-cyan-600'
                                        }`}>
                                            {group.is_private ? <Lock className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                                        </div>
                        
                                        {/* Status Badge */}
                                        <div className="mt-1"> 
                                            {isMember ? (
                                                <span className="bg-green-50 text-green-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-green-100">
                                                    Member
                                                </span>
                                            ) : (
                                                <span className="bg-slate-50 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-slate-100">
                                                    {group.frequency}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-8">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight truncate pr-16" title={group.title}>{group.title}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Asset Rotation Group</p>
                                    </div>
                                    
                                    {/* Details */}
                                    <div className="space-y-4 flex-1">
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-cyan-50 group-hover:border-cyan-100 transition-all">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contribution</p>
                                            <p className="text-xl font-black text-slate-900 tracking-tight">₦{amount.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center text-xs font-bold text-slate-500 px-2 gap-2">
                                            <Calendar className="w-4 h-4 text-cyan-500" />
                                            <span>Start: {new Date(group.start_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Actions Footer */}
                                    <div className="mt-8 pt-6 border-t border-slate-50">
                                        {isMember ? (
                                            <Link 
                                                href={`/dashboard/ajo/${group.id}`}
                                                className="flex items-center justify-center w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 text-[10px] uppercase tracking-[0.2em] group/btn"
                                            >
                                                Dashboard
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                        ) : (
                                            <div className="w-full">
                                                <JoinButton groupId={group.id} isPrivate={group.is_private} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
