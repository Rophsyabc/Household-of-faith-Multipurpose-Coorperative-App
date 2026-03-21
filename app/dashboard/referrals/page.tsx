import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Share2, Users, Gift, Copy, CheckCircle2, TrendingUp, Star, Award } from 'lucide-react';
import { RealtimeReferrals } from './realtime-referrals';

export default async function ReferralsPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user?.id)
        .single();

    const { data: referrals } = await supabase
        .from('referral_ledger')
        .select('*, referred:referred_id(full_name, kyc_status, created_at)')
        .eq('referrer_id', user?.id)
        .order('created_at', { ascending: false });

    const totalEarned = referrals?.filter(r => r.status === 'paid').reduce((acc, curr) => acc + Number(curr.bonus_amount), 0) || 0;
    const pendingEarned = referrals?.filter(r => r.status === 'pending').reduce((acc, curr) => acc + Number(curr.bonus_amount), 0) || 0;

    const referralLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://faithcoop.app'}/auth?ref=${profile?.referral_code}`;

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-24">
            <RealtimeReferrals userId={user?.id || ''} />
            
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex p-4 bg-cyan-100 text-cyan-600 rounded-[2rem] shadow-xl shadow-cyan-100/50 animate-bounce">
                    <Gift className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Refer & Earn</h1>
                <p className="text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                    Help our community grow and earn <span className="text-cyan-600 font-bold">₦500</span> for every verified member you invite.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-cyan-200 transition-all">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <Award className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Earned</p>
                    <p className="text-2xl font-black text-slate-900">₦{totalEarned.toLocaleString()}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-orange-200 transition-all">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Rewards</p>
                    <p className="text-2xl font-black text-slate-900">₦{pendingEarned.toLocaleString()}</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center group hover:border-purple-200 transition-all">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <Users className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Referrals</p>
                    <p className="text-2xl font-black text-slate-900">{referrals?.length || 0}</p>
                </div>
            </div>

            {/* Share Section */}
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full -mr-48 -mt-48 blur-3xl" />
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                            <Share2 className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Your Network Link</h2>
                            <p className="text-slate-400 text-xs font-medium">Spread the word and track your impact in real-time.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all overflow-hidden">
                            <span className="text-sm font-bold text-cyan-400 truncate mr-4">{referralLink}</span>
                            <Copy className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors shrink-0" />
                        </div>
                        <button className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl active:scale-95 text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                            <Share2 className="w-4 h-4" /> Share Direct
                        </button>
                    </div>
                </div>
            </div>

            {/* Referral List */}
            <div className="space-y-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Impact History</h2>
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-50">
                    {(!referrals || referrals.length === 0) ? (
                        <div className="p-20 text-center flex flex-col items-center">
                            <Star className="w-12 h-12 text-slate-100 mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No members referred yet</p>
                        </div>
                    ) : (
                        referrals.map((ref: any) => (
                            <div key={ref.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg transition-transform group-hover:scale-110">
                                        {ref.referred?.full_name?.[0] || 'M'}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-base tracking-tight">{ref.referred?.full_name || 'Member'}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                            Joined {new Date(ref.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black text-base tracking-tight ${ref.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {ref.status === 'paid' ? '+₦500' : 'Pending'}
                                    </p>
                                    <div className="flex items-center justify-end gap-1.5 mt-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${ref.referred?.kyc_status === 'verified' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                        <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest">
                                            {ref.referred?.kyc_status === 'verified' ? 'Verified' : 'Unverified'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
