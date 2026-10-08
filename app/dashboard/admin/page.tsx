import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { StatsCards } from './stats-cards';
import { KycList } from './kyc-list';
import { GroupsList } from './groups-list';
import { LoanList } from './loan-list'; 
import { WithdrawalList } from './withdrawal-list';
import { SupportList } from './support-list';
import { AnnouncementManager } from './announcement-form';
import { RealtimeAdminObserver } from './realtime-admin-observer';
import { ShieldCheck, Activity, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { get(name: string) { return cookieStore.get(name)?.value; } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/auth');

    // Security Check: Use Database-level Admin Status
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    const isDesignatedAdmin = Boolean(
        process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
        user.email?.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_EMAIL.toLowerCase()
    );

    if (!profile?.is_admin || !isDesignatedAdmin) {
        redirect('/dashboard');
    }

    // 1. Pending KYCs
    const { data: pendingUsers } = await supabase
        .from('profiles')
        .select('*')
        .eq('kyc_status', 'pending');

    const { count: pendingCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('kyc_status', 'pending');

    // 2. Active Groups
    const { data: groups } = await supabase
        .from('ajo_groups')
        .select('*')
        .order('created_at', { ascending: false });

    const { count: activeGroupCount } = await supabase
        .from('ajo_groups')
        .select('*', { count: 'exact', head: true });

    // 3. Loans for Management
    const { data: loans } = await supabase
        .from('loans')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

    // 4. Withdrawal Requests (Include Bank Details)
    const { data: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('*, profiles(full_name, phone), bank_accounts(*)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    // 5. Support Tickets
    const { data: tickets } = await supabase
        .from('support_tickets')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });

    // 6. Treasury Balance
    const { data: treasury } = await supabase
        .from('cooperative_treasury')
        .select('total_fees_collected')
        .eq('id', 1)
        .single();

    // 7. Total Volume (Inflow)
    const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .in('type', ['credit', 'loan', 'dividend', 'referral_bonus']);

    const totalVolume = transactions?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    return (
        <div className="space-y-10 pb-24">
            <RealtimeAdminObserver />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Admin Command Center
                        <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-slate-800 shadow-xl">
                            Root Access
                        </span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Global oversight of the cooperative's financial and social health.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-green-50 text-green-600 px-4 py-2 rounded-2xl border border-green-100 flex items-center gap-2 shadow-sm">
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Engine</span>
                    </div>
                    <div className="bg-cyan-600 text-white p-3 rounded-2xl shadow-lg shadow-cyan-200">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <StatsCards 
                pendingCount={pendingCount || 0}
                activeGroupCount={activeGroupCount || 0}
                totalVolume={totalVolume}
            />

            <AnnouncementManager treasuryBalance={Number(treasury?.total_fees_collected) || 0} />

            <div className="grid grid-cols-1 gap-12">
                {/* 1. Cash Outflow (Highest Priority) */}
                <WithdrawalList requests={withdrawals} />

                {/* 2. Support Tickets */}
                <SupportList tickets={tickets} />

                {/* 3. Loan Applications */}
                <LoanList loans={loans} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* 4. KYC Verification */}
                    <KycList users={pendingUsers} />

                    {/* 5. Cooperative Groups */}
                    <GroupsList groups={groups} />
                </div>
            </div>

            {/* Bottom System Note */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-10 flex flex-col items-center text-center gap-4">
                <Zap className="w-10 h-10 text-slate-200" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Encrypted Governance Module</p>
                <p className="text-xs text-slate-400 max-w-md font-medium leading-relaxed">
                    All administrative actions are logged and immutable. Misuse of the Root Access portal will trigger immediate security protocols.
                </p>
            </div>
        </div>
    );
}
