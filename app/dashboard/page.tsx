import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { 
    Wallet, ShieldCheck, Sparkles, ArrowRight, Banknote,
} from 'lucide-react';
import { RealtimeStats } from './realtime-stats';
import { RealtimeBalance } from '../components/RealtimeBalance';
import { RealtimeLedger } from './realtime-ledger';
import { RealtimeAnnouncements } from './realtime-announcements';

interface Transaction {
    id: string;
    amount: number;
    type: 'credit' | 'debit' | 'fee' | 'loan' | 'dividend' | 'referral_bonus' | 'repayment' | 'transfer_in' | 'transfer_out';
    description: string;
    created_at: string;
}

interface Announcement {
    id: string;
    title: string;
    content: string;
    is_priority: boolean;
    created_at: string;
}

import { redirect } from 'next/navigation';

export default async function DashboardPage(props: {
    searchParams?: Promise<{ view?: string }>;
}) {
    const searchParams = props.searchParams ? await props.searchParams : {};
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // Database is_admin check (authoritative source of truth)
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user?.id)
        .single();

    const adminEmailEnv = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim();
    const passesEmailCheck = !adminEmailEnv
        || user?.email?.toLowerCase() === adminEmailEnv.toLowerCase();
    const isAdmin = Boolean(profile?.is_admin && passesEmailCheck);

    // If an admin navigates to /dashboard without ?view=member, forward directly to the Admin Command Center
    if (isAdmin && searchParams?.view !== 'member') {
        redirect('/dashboard/admin');
    }

    const [
        { data: rawWallet },
        { count: activeGroups },
        { data: transactions },
        { data: announcements },
        { data: goals },
        { data: tickets }
    ] = await Promise.all([
        supabase.from('wallets').select('balance').eq('user_id', user?.id).single(),
        supabase.from('ajo_members').select('*', { count: 'exact', head: true }).eq('user_id', user?.id),
        supabase.from('transactions').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(1),
        supabase.from('savings_goals').select('*').eq('user_id', user?.id).neq('status', 'withdrawn'),
        supabase.from('support_tickets').select('*').eq('user_id', user?.id).eq('status', 'open')
    ]);

    const balance = rawWallet?.balance || 0;
    const totalSaved = goals?.reduce((acc, goal) => acc + Number(goal.current_amount), 0) || 0;
    const activeStreak = goals?.reduce((max, goal) => Math.max(max, goal.streak_count || 0), 0) || 0;

    return (
        <div className="space-y-10 pb-24">
            {isAdmin && (
                <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl border border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cyan-600 flex items-center justify-center text-white shrink-0">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[11px] font-black uppercase tracking-wider text-cyan-400">Administrator Preview</p>
                            <p className="text-xs text-slate-300 font-medium">You are previewing the standard member dashboard view.</p>
                        </div>
                    </div>
                    <Link href="/dashboard/admin" className="text-xs font-black bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-full transition shadow-md flex items-center gap-2 shrink-0">
                        <span>Back to Admin Console</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Hi, Member <Sparkles className="w-6 h-6 text-yellow-400 fill-current" />
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">Ready to build your financial legacy today?</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link href="/dashboard/wallet" className="flex-1 md:flex-none bg-cyan-600 text-white px-6 py-4 rounded-full text-sm font-black hover:bg-cyan-700 transition shadow-xl active:scale-95 flex items-center justify-center gap-2">
                        <Banknote className="w-4 h-4" /> Fund Wallet
                    </Link>
                </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="relative z-10 space-y-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-50">Secured Portfolio</span>
                        </div>
                        <Wallet className="w-6 h-6 opacity-30" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Available Liquidity</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-cyan-500">₦</span>
                            <RealtimeBalance initialBalance={balance} userId={user?.id || ''} className="text-6xl font-black tracking-tighter" />
                        </div>
                    </div>
                    <div className="pt-6 flex items-center gap-8 border-t border-white/5">
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Savings Goal Progress</p>
                            <p className="text-lg font-black text-cyan-400">₦{totalSaved.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <RealtimeStats 
                initialActiveGroups={activeGroups || 0}
                initialActiveGoals={goals?.length || 0}
                initialOpenTickets={tickets?.length || 0}
                initialAnnouncementsCount={announcements?.length || 0}
                userId={user?.id || ''}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px] ml-4">Featured Services</h3>
                    <RealtimeAnnouncements initialAnnouncement={announcements?.[0] || null} />
                    
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">KYC Reward</p>
                            <p className="text-xs font-bold text-slate-700">Invite 3 friends to get ₦1,500 bonus!</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <RealtimeLedger initialTransactions={transactions as Transaction[]} userId={user?.id || ''} />
                </div>
            </div>
        </div>
    );
}